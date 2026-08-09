import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  // TypeOrmModule.forFeature registers the repository for this entity
  // scoped to this module — keeps User's persistence logic contained here
  // even though Auth and Tasks both need to reference it.
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService], // exported so AuthModule can inject it
})
export class UsersModule {}