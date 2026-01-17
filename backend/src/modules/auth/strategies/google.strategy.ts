import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret) {
      // Use placeholder values to prevent crash on startup
      // Authentication will fail at runtime if credentials are not configured
      super({
        clientID: 'not-configured',
        clientSecret: 'not-configured',
        callbackURL: callbackURL || 'http://localhost:3000/api/auth/google/callback',
        scope: ['email', 'profile'],
      });
      return;
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;
    const user = {
      googleId: id,
      email: emails?.[0]?.value,
      name: displayName,
      avatarUrl: photos?.[0]?.value,
    };
    done(null, user);
  }
}
