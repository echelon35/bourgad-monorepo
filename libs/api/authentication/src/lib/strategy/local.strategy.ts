import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginService } from '../login/login.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private loginService: LoginService) {
    super({ usernameField: 'mail' });
  }

  async validate(mail: string, password: string): Promise<any> {
    const user = await this.loginService.validateUser(mail, password);
    if (!user) {
      throw new UnauthorizedException(
        'Adresse mail ou mot de passe incorrect',
        {
          cause: new Error(),
          description: 'Adresse mail ou mot de passe incorrect',
        },
      );
    } else if (user?.provider == 'GOOGLE') {
      throw new UnauthorizedException(
        'Un compte Google existe à cette adresse, veuillez-vous connecter via le bouton Google',
      );
    } else if (!user?.isEmailVerified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre adresse mail en cliquant sur le lien envoyé par mail',
      );
    }
    return user;
  }
}
