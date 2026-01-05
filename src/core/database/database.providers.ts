import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: configService.get<'mysql' | 'mariadb' | 'postgres' | 'cockroachdb' | 'sqlite' | 'mssql' | 'sap' | 'oracle' | 'cordova' | 'nativescript' | 'react-native' | 'sqljs' | 'mongodb' | 'aurora-mysql' | 'aurora-postgres' | 'expo' | 'better-sqlite3' | 'capacitor' | 'spanner'>('database.type') as any,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password') || '',
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        ssl: configService.get<boolean>('database.ssl') as any,
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        subscribers: [__dirname + '/subscribers/*{.ts,.js}'],
        extra: {
          charset: configService.get<string>('database.charset'),
          timezone: configService.get<string>('database.timezone'),
          // Connection pool configuration for mysql2
          connectionLimit: configService.get<number>('database.connectionLimit', 10),
          // acquireTimeout: configService.get<number>('database.acquireTimeout', 60000),
          // timeout: configService.get<number>('database.timeout', 60000),
          // reconnect: configService.get<boolean>('database.reconnect', true),
        },
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
