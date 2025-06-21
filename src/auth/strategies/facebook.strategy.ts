import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: `${process.env.BASE_URL}/auth/facebook/redirect`,
      profileFields: ['id', 'emails', 'name'],
      passReqToCallback: true, // ✅ required
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { emails, name, id } = profile;
    return {
      email: emails?.[0]?.value,
      first_name: name?.givenName,
      last_name: name?.familyName,
      provider: 'facebook',
      providerId: id,
    };
  }
}
