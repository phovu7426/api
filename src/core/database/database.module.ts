import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { databaseProviders } from '@/core/database/database.providers';
import { SeedService } from '@/core/database/seeder/seed-data';
import { SeedPermissions } from '@/core/database/seeder/seed-permissions';
import { SeedRoles } from '@/core/database/seeder/seed-roles';
import { SeedUsers } from '@/core/database/seeder/seed-users';
import { SeedPostCategories } from '@/core/database/seeder/seed-post-categories';
import { SeedPostTags } from '@/core/database/seeder/seed-post-tags';
import { SeedPosts } from '@/core/database/seeder/seed-posts';
import { SeedMenus } from '@/core/database/seeder/seed-menus';
import { SeedBannerLocations } from '@/core/database/seeder/seed-banner-locations';
import { SeedBanners } from '@/core/database/seeder/seed-banners';
import { SeedContacts } from '@/core/database/seeder/seed-contacts';
import { SeedGeneralConfigs } from '@/core/database/seeder/seed-general-configs';
import { SeedEmailConfigs } from '@/core/database/seeder/seed-email-configs';
import { SeedGroups } from '@/core/database/seeder/seed-groups';
import { SeedComicCategories } from '@/core/database/seeder/seed-comic-categories';
import { SeedComics } from '@/core/database/seeder/seed-comics';
import { SeedChapters } from '@/core/database/seeder/seed-chapters';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: configService.get<'mysql' | 'mariadb' | 'postgres' | 'cockroachdb' | 'sqlite' | 'mssql' | 'sap' | 'oracle' | 'cordova' | 'nativescript' | 'react-native' | 'sqljs' | 'mongodb' | 'aurora-mysql' | 'aurora-postgres' | 'expo' | 'better-sqlite3' | 'capacitor' | 'spanner'>('database.type') as any,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password') || '',
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        ssl: configService.get<boolean>('database.ssl') as any,
        extra: {
          charset: configService.get<string>('database.charset'),
          timezone: configService.get<string>('database.timezone'),
          connectionLimit: configService.get<number>('database.connectionLimit', 10),
          // acquireTimeout: configService.get<number>('database.acquireTimeout', 60000),
          // timeout: configService.get<number>('database.timeout', 60000),
          // reconnect: configService.get<boolean>('database.reconnect', true),
        },
        autoLoadEntities: configService.get<boolean>('database.autoLoadEntities') ?? true,
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        subscribers: [__dirname + '/subscribers/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ...databaseProviders,
    SeedService,
    SeedPermissions,
    SeedRoles,
    SeedUsers,
    SeedPostCategories,
    SeedPostTags,
    SeedPosts,
    SeedMenus,
    SeedBannerLocations,
    SeedBanners,
    SeedContacts,
    SeedGeneralConfigs,
    SeedEmailConfigs,
    SeedGroups,
    SeedComicCategories,
    SeedComics,
    SeedChapters,
  ],
  exports: [
    ...databaseProviders,
    SeedService,
  ],
})
export class DatabaseModule { }
