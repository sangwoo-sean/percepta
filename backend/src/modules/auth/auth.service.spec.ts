import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService, GoogleProfile } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    googleId: 'google-123',
    credits: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    personas: [],
    feedbackSessions: [],
  };

  const mockGoogleProfile: GoogleProfile = {
    googleId: 'google-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByGoogleId: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOrCreateGoogleUser', () => {
    it('should return existing user when found by googleId', async () => {
      usersService.findByGoogleId.mockResolvedValue(mockUser);

      const result = await service.validateOrCreateGoogleUser(mockGoogleProfile);

      expect(result).toEqual(mockUser);
      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-123');
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should create new user when not found', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.validateOrCreateGoogleUser(mockGoogleProfile);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith({
        email: mockGoogleProfile.email,
        name: mockGoogleProfile.name,
        avatarUrl: mockGoogleProfile.avatarUrl,
        googleId: mockGoogleProfile.googleId,
      });
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      jwtService.sign.mockReturnValue('test-token');

      const result = service.generateToken(mockUser);

      expect(result).toBe('test-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });

  describe('login', () => {
    it('should return access token and user', async () => {
      usersService.findByGoogleId.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('test-token');

      const result = await service.login(mockGoogleProfile);

      expect(result).toEqual({
        accessToken: 'test-token',
        user: mockUser,
      });
    });
  });

  describe('validateToken', () => {
    it('should return user when token is valid', async () => {
      jwtService.verify.mockReturnValue({ sub: mockUser.id });
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockUser);
    });

    it('should return null when token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });
  });
});
