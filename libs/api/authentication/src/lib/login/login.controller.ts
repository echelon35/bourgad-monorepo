import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Body,
  HttpException,
  Query,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { LocalAuthGuard, Public } from '@bourgad-monorepo/back-core';
import * as express from 'express';
import { ChangePasswordDto } from '@bourgad-monorepo/internal';

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@Request() req: express.Request) {
    return this.loginService.login(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: express.Request) {
    if (req?.user != null) {
      return this.loginService.logout(req?.user?.id);
    } else {
      return false;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('expiration')
  async tokenExpiration() {
    return this.loginService.checkTokenExpiration();
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Query('mail') mail: string) {
    try {
      await this.loginService.sendPasswordReinitialisation(mail);
      return true;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('change-password')
  @Public()
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      await this.loginService.changePassword(changePasswordDto);
      return true;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
