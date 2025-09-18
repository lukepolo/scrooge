import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { ConfigModule } from '@nestjs/config';
import configs from './configs';
import { loggerFactory } from './utilities/LoggerFactory';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    PostgresModule,
  ],
  providers: [loggerFactory()],
  controllers: [],
})
export class AppModule {}
