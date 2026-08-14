import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    // Global config module so ConfigService is injectable everywhere
    // without re-importing ConfigModule in every feature module.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Async registration lets us pull DB credentials from ConfigService
    // instead of hardcoding them — required for any real deployment
    // (Render/Vercel will inject their own env vars).
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true, // picks up entities registered via forFeature() in each module
        synchronize: true, // ⚠️ OK for assessment/dev; switch to migrations before "real" prod
      }),
    }),

    UsersModule,
    AuthModule,
    TasksModule,
    ProjectsModule,
  ],
})
export class AppModule {}