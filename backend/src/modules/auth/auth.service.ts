import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(profile.email);

      if (user) {
        // User exists with email but no Google ID - link accounts
        user = await this.usersService.create({
          ...profile,
          googleId: profile.googleId,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          googleId: profile.googleId,
        });
      }
    }

    return user;
  }

  generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async login(profile: GoogleProfile): Promise<AuthResponse> {
    const user = await this.validateOrCreateGoogleUser(profile);
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user,
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      return this.usersService.findById(payload.sub);
    } catch {
      return null;
    }
  }
}
