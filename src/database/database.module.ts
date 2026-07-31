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
          encrypt: false, // true solo si te conectas a Azure SQL
          trustServerCertificate: true, // necesario para desarrollo local sin certificado válido
        },
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // NUNCA true contra una base real con datos reales de AdventureWorks
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
