import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST', 'sqlserver'),
        port: parseInt(config.get<string>('DB_PORT', '1433'), 10),
        username: config.get<string>('DB_USER', 'sa'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'AdventureWorks'),
        options: {
          encrypt: config.get<string>('DB_ENCRYPT', 'false') === 'true',
          trustServerCertificate:
            config.get<string>('DB_TRUST_CERT', 'true') === 'true',
        },
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // NUNCA true contra una base real con datos reales de AdventureWorks
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
