import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@bourgad-monorepo/user';
import { SignUpController } from './signup/signup.controller';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [SignUpController, LoginController],
  providers: [LoginService],
})
export class AuthenticationModule {}
