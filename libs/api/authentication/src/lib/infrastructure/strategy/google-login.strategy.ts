import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { UserService } from '@bourgad-monorepo/user';

config();

@Injectable()
export class GoogleLoginStrategy extends PassportStrategy(
  Strategy,
  'google-login',
) {
  constructor(private userService: UserService) {
    super({
      clientID: process.env['GOOGLE_API'],
      clientSecret: process.env['GOOGLE_API_SECRET'],
      callbackURL: process.env['BASE_URI'] + '/auth/google/login/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails } = profile;
    const mail = emails[0].value;
    const userInDb = await this.userService.findOne(mail, false, false);

    if (userInDb) {
      await this.userService.updateConnectionTime(userInDb.userId);
    }

    return done(null, userInDb || null);
  }
}
