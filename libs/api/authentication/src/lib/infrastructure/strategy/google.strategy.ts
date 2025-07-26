import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { UserService } from '@bourgad-monorepo/api/user';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  override validate(...args: any[]): unknown {
    throw new Error('Method not implemented.');
  }
  constructor(private userService: UserService) {
    super({
      clientID: process.env['GOOGLE_API'],
      clientSecret: process.env['GOOGLE_API_SECRET'],
      callbackURL: process.env['BASE_URI'] + '/auth/google/login/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }
}
