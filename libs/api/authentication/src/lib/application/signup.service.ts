import { SignUpDto, GoogleLoginDto, MediaDto } from "@bourgad-monorepo/internal";
import { MediaService } from "@bourgad-monorepo/api/media";
import { User } from "@bourgad-monorepo/model";
import { UserService } from "@bourgad-monorepo/api/user";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs';
import { EmailerService } from "@bourgad-monorepo/api/mail";

@Injectable()
export class SignUpService {
  constructor(private userService: UserService, 
    private mediaService: MediaService,
    private mailService: EmailerService,
    private configService: ConfigService) {}

  async sendRegisterMail(user: User){
    const bourgadSecret = this.configService.get<string>('BOURGAD_SECRET');
    if(!bourgadSecret) {
      throw new Error('BOURGAD_SECRET is not defined in the environment variables');
    }
    const newToken = jwt.sign(
      { id: user.userId, mail: user.mail },
      bourgadSecret,
      { expiresIn: '1h' },
    );
    const confirmationUrl = `${process.env["BOURGAD_FRONT_BASE_URI"]}/confirm-email?token=${encodeURIComponent(newToken)}`;
    await this.mailService.sendConfirmationMail(user.mail, confirmationUrl);
  }

  async signUp(createUserDto: SignUpDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = {
      ...createUserDto,
      password: hashedPassword
    };
    const createdUser = await this.userService.createUser(user);
    await this.sendRegisterMail(createdUser);

    return createdUser;
  }

  async resendConfirmationEmail(mail: string): Promise<void> {
    const user = await this.userService.findOne(mail, false);
    if (!user) {
      throw new Error('Aucun utilisateur trouvé');
    }

    await this.sendRegisterMail(user);

  }

  async googleSignup(googleLogin: GoogleLoginDto): Promise<any> {
    const userExists = await this.userService.findOne(googleLogin.mail);
    if (userExists) {
      throw new ConflictException(
        'Cet email est déjà utilisé. Veuillez-vous connecter.',
      );
    }

    const avatar = await this.mediaService.create({
        url: googleLogin.avatar,
        type: 'image',
        name: `avatar-${googleLogin.mail}`,
        size: 0,
    } as MediaDto);

    const user = await this.userService.createUser({
      ...googleLogin,
      avatar,
      verifiedMail: false,
    });

    const bourgadSecret = this.configService.get<string>('BOURGAD_SECRET');
    if (!bourgadSecret) {
      throw new Error('BOURGAD_SECRET is not defined in the environment variables');
    }

    // Créer le token de vérification
    const emailVerificationToken = jwt.sign(
      { id: user.userId, mail: user.mail },
      bourgadSecret,
      { expiresIn: '1h' },
    );

    // Envoi de l'email de confirmation
    const confirmationUrl = `${process.env["BOURGAD_FRONT_BASE_URI"]}/confirm-email?token=${encodeURIComponent(emailVerificationToken)}`;
    await this.mailService.sendConfirmationMail(user.mail, confirmationUrl);

    return user;
  }

  async confirmEmail(token: string) {
    const bourgadSecret = this.configService.get<string>('BOURGAD_SECRET');
    if (!bourgadSecret) {
      throw new Error('BOURGAD_SECRET is not defined in the environment variables');
    }
    
    const payload = jwt.verify(
      token,
      bourgadSecret,
    ) as jwt.JwtPayload;

    const userId = payload["id"];
    if (userId == null) {
      throw new UnauthorizedException('Token incorrect');
    }

    const user = await this.userService.findOneByPk(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.verifiedMail) {
      throw new Error('L’email a déjà été vérifié.');
    }

    // Confirme l’email
    user.verifiedMail = true;
    await this.userService.saveUser(user);
  }
}