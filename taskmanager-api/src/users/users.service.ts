import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthProvider } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface GoogleProfileInput { email: string; fullName: string; avatarUrl: string | null; }

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createGuest(): Promise<User> {
    const guest = this.userRepository.create({
      username: `guest_${uuidv4().slice(0, 8)}`,
      authProvider: AuthProvider.GUEST,
    });
    return this.userRepository.save(guest);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'ASC' } });
  }

  // NEW — first-time Google sign-in. Username is derived from the email
  // prefix, with a numeric suffix loop to guarantee uniqueness rather than
  // a random uuid slice (guests get the random one; Google users get a
  // readable one since we actually have a name to work with).
  async createGoogleUser(profile: GoogleProfileInput): Promise<User> {
    const base = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
    let username = base;
    let suffix = 0;
    while (await this.userRepository.findOneBy({ username })) {
      suffix += 1;
      username = `${base}${suffix}`;
    }
    const user = this.userRepository.create({
      username,
      authProvider: AuthProvider.GOOGLE,
      email: profile.email,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    });
    return this.userRepository.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.username) {
      const existing = await this.userRepository.findOne({ where: { username: dto.username } });
      if (existing && existing.id !== id) {
        throw new ConflictException('That username is already taken');
      }
    }
    try {
      await this.userRepository.update(id, dto);
    } catch (err: any) {
      // Postgres unique_violation — catches the race the app-level check
      // above can't: two near-simultaneous requests can both pass that
      // SELECT before either UPDATE commits. This is the actual guard.
      if (err?.code === '23505') {
        throw new ConflictException('That username is already taken');
      }
      throw err;
    }
    return this.userRepository.findOneBy({ id }) as Promise<User>;
  }
}