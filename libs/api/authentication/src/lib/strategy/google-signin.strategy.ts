import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';

config();

@Injectable()
export class GoogleSigninStrategy extends PassportStrategy(
  Strategy,
  'google-signin',
) {
  constructor() {
    super({
      clientID: process.env['GOOGLE_API'],
      clientSecret: process.env['GOOGLE_API_SECRET'],
      callbackURL: process.env['BASE_URI'] + '/auth/google/signin/callback',
      scope: ['email', 'profile'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, displayName, id } = profile;
    // //console.log(profile);
    const user = {
      username: displayName,
      mail: emails[0].value,
      firstname: name.givenName,
      lastname: name.familyName,
      avatar: photos[0].value,
      provider: 'GOOGLE',
      providerId: id,
      accessToken,
    };
    done(null, user || null);
  }
}
