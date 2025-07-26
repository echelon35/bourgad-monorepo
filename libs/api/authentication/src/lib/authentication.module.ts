import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserModule } from '@bourgad-monorepo/user';
import { LoginService } from './application/login.service';
import { MediaModule } from '@bourgad-monorepo/media';
import { SignUpService } from './application/signup.service';
import { MailModule } from '@bourgad-monorepo/mail';
import { JwtStrategy } from './infrastructure/strategy/jwt.strategy';
import { GoogleLoginStrategy } from './infrastructure/strategy/google-login.strategy';
import { GoogleSigninStrategy } from './infrastructure/strategy/google-signin.strategy';
import { GoogleStrategy } from './infrastructure/strategy/google.strategy';
import { LocalStrategy } from './infrastructure/strategy/local.strategy';
import { SignUpController } from './controller/signup.controller';
import { LoginController } from './controller/login.controller';

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
