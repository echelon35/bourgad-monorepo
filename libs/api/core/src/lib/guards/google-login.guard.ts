import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleLoginGuard extends AuthGuard('google-login') {
  constructor(private configService: ConfigService) {
    super();
  }

  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();
    if (user == null) {
      response.redirect(
        `${process.env['BOURGAD_FRONT_BASE_URI']}/login?error=${encodeURI('Aucun compte trouvé à cette adresse')}`,
      );
      throw new Error('Aucun compte trouvé correspondant à cette adresse');
    }
    return user;
  }
}
