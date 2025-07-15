import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@bourgad-monorepo/user';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { MediaModule } from '@bourgad-monorepo/media';
import { SignUpService } from './signup/signup.service';
import { SignUpController } from './signup/signup.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MediaModule,
  ],
  controllers: [SignUpController, LoginController],
  providers: [LoginService, SignUpService],
})
export class AuthenticationModule {}
