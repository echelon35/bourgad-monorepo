import { GoogleSigninGuard, Public } from '@bourgad-monorepo/api/core';
import {
  Controller,
  Post,
  HttpStatus,
  UseGuards,
  Request,
  Response,
  Get,
  Body,
  HttpException,
  Query,
} from '@nestjs/common';
import { ResendConfirmationMailDto, SignUpDto } from '@bourgad-monorepo/internal';
import * as Express from 'express';
import { SignUpService } from '../application/signup.service';

@Controller()
export class SignUpController {
  constructor(private signUpService: SignUpService) {}

  @Post('resend-confirmation-mail')
  @Public()
  async resendConfirmationEmail(@Query() params: ResendConfirmationMailDto) {
    try {
      await this.signUpService.resendConfirmationEmail(params.mail);
      return {
        message: `Un nouveau lien de confirmation a été envoyé à l'adresse ${params.mail}.`,
      };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('signup')
  @Public()
  async signUp(@Body() createUserDto: SignUpDto) {
    try {
      return await this.signUpService.register(createUserDto);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('google/signin')
  @Public()
  @UseGuards(GoogleSigninGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleSignin() {}

  @Get('confirm-email')
  @Public()
  async confirmEmail(@Query('token') token: string) {
    try {
      await this.signUpService.confirmEmail(token);
      return { message: 'Email confirmé avec succès' };
    } catch (error) {
      throw new HttpException(
        'Lien de confirmation invalide ou expiré : ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('google/signin/callback')
  @Public()
  @UseGuards(GoogleSigninGuard)
  async googleSignInRedirect(@Request() req: Express.Request, @Response() res: Express.Response) {
    try {
      const user = await this.signUpService.googleRegister(req.user);
      const mail = user?.mail;
      return res.redirect(
        `${process.env['BOURGAD_FRONT_BASE_URI']}?mail=${mail}`,
      );
    } catch (e: any) {
      return res.redirect(
        `${process.env['BOURGAD_FRONT_BASE_URI']}/login?error=${encodeURI(e.message)}`,
      );
    }
  }
}
