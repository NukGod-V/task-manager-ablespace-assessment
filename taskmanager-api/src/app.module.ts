import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { CommentsModule } from './comments/comments.module';

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
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        // Neon/Supabase/Render Postgres all hand you a single connection
        // string — simpler and less error-prone than 5 separate host/port/
        // user/password/name vars. Falls back to the original DB_* vars for
        // local dev, which is unchanged from Phase 1.
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {rejectUnauthorized: false}, // required by cloud Postgres providers
          };
        }
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    UsersModule,
    AuthModule,
    TasksModule,
    ProjectsModule,
    CommentsModule,
  ],
})
export class AppModule {}