import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthProvider } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'ASC' } });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.username) {
      const existing = await this.userRepository.findOne({ where: { username: dto.username } });
      if (existing && existing.id !== id) {
        throw new ConflictException('That username is already taken');
      }
    }
    await this.userRepository.update(id, dto);
    return this.userRepository.findOneBy({ id }) as Promise<User>;
  }
}