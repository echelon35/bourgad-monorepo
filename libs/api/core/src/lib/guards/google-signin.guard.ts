import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleSigninGuard extends AuthGuard('google-signin') {
  constructor(private reflector: Reflector) {
    super();
  }
}
