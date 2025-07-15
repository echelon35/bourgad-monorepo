import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { EmailerService } from '@bourgad-monorepo/mail';
import { UserService } from '@bourgad-monorepo/user';
import { ChangePasswordDto, GoogleLoginDto, LoginDto } from '@bourgad-monorepo/internal';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: EmailerService,
    private configService: ConfigService,
  ) {}

  /**
   *
   * @param user
   * @returns
   */
  async login(user: LoginDto): Promise<any> {
    return {
      access_token: this.jwtService.sign({ user: user }),
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    if (
      changePasswordDto?.password == null ||
      changePasswordDto?.token == null
    ) {
      throw new Error('Mot de passe ou token invalide');
    }
    const hashedPassword = await bcrypt.hash(changePasswordDto?.password, 10);

    const bourgadSecret = this.configService.get<string>('BOURGAD_SECRET');

    if (!bourgadSecret) {
      throw new Error('BOURGAD_SECRET is not defined in the environment variables');
    }

    const payload = jwt.verify(
      changePasswordDto?.token,
      bourgadSecret,
    ) as jwt.JwtPayload;

    if (payload['userId'] == null) {
      throw new UnauthorizedException('Token incorrect');
    }

    await this.userService.updatePassword(payload['userId'], hashedPassword);
  }

  /**
   * Test user mail / password to return user
   * @param mail user mail
   * @param pass user password
   * @returns user || null
   */
  async validateUser(mail: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(mail, false, false);

    if (user && user.provider !== 'LOCAL') {
      throw new UnauthorizedException(
        'Un compte gmail existe déjà à cette adresse. Veuillez-vous connecter avec le bouton de connexion Google',
      );
    }

    if (user && bcrypt.compareSync(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      user.updatedAt = new Date();
      await this.userService.saveUser(user);
      return result;
    }
    return null;
  }

  /**
   * Log out connected user
   * @param id userId
   * @returns boolean isLogOut
   */
  async logout(id: number): Promise<boolean> {
    const user = await this.userService.findOneByPk(id);
    return await this.userService.logout(user);
  }

  /**
   * @returns true if token not expires
   */
  async checkTokenExpiration(): Promise<boolean> {
    return true;
  }

  async sendPasswordReinitialisation(mail: string): Promise<void> {
    const user = await this.userService.findOne(mail, false, false);
    if (!user) {
      throw new Error('Aucun utilisateur trouvé');
    } else if (user?.provider !== 'LOCAL') {
      throw new Error(
        `L'adresse correspond à un compte Google, veuillez utiliser le bouton de connexion dédié pour vous connecter.`,
      );
    }

    const bourgadSecret = this.configService.get<string>('BOURGAD_SECRET');

    if(bourgadSecret == null) {
      throw new Error('BOURGAD_SECRET is not defined in the environment variables');
    }

    // Générer un nouveau token et le stocker avec une nouvelle expiration
    const newToken = jwt.sign(
      { userId: user.userId },
      bourgadSecret,
      {
        expiresIn: '1h',
      },
    );

    // Envoyer le lien de réinitialisation par mail
    const confirmationUrl = `${process.env['BOURGAD_FRONT_BASE_URI']}/change-password?token=${encodeURIComponent(newToken)}`;
    await this.mailService.sendPasswordReinitialization(
      user.mail,
      confirmationUrl,
    );
  }

  /**
   * Search for a user send by google and create it if not exists
   * @param googleLogin user mail
   * @returns token with user
   */
  async googleLogin(googleLogin: GoogleLoginDto): Promise<any> {
    return {
      access_token: this.jwtService.sign({ user: googleLogin }),
    };
  }

}
