import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthProvider } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Every guest needs *some* username to satisfy the entity/unique constraint,
  // even though the person never typed one — generate a short, unique handle.
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
    // Powers the "add members" picker on Create Project — every guest user,
    // no search/pagination. Fine at demo scale.
    return this.userRepository.find({ order: { createdAt: 'ASC' } });
  }
}
