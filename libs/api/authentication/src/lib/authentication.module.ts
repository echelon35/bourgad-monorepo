import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserModule } from '@bourgad-monorepo/user';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { MediaModule } from '@bourgad-monorepo/media';
import { SignUpService } from './signup/signup.service';
import { SignUpController } from './signup/signup.controller';
import { MailModule } from '@bourgad-monorepo/mail';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleLoginStrategy } from './strategy/google-login.strategy';
import { GoogleSigninStrategy } from './strategy/google-signin.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { LocalStrategy } from './strategy/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MediaModule,
    MailModule,
    UserModule
  ],
  controllers: [SignUpController, LoginController],
  providers: [LoginService, SignUpService, JwtStrategy, GoogleLoginStrategy, GoogleSigninStrategy, GoogleStrategy, LocalStrategy],
})
export class AuthenticationModule {}
