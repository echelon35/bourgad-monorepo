import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserModule } from '@bourgad-monorepo/user';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { MediaModule } from '@bourgad-monorepo/media';
import { SignUpService } from './signup/signup.service';
import { SignUpController } from './signup/signup.controller';
import { MailModule } from '@bourgad-monorepo/mail';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MediaModule,
    MailModule,
    UserModule
  ],
  controllers: [SignUpController, LoginController],
  providers: [LoginService, SignUpService],
})
export class AuthenticationModule {}
