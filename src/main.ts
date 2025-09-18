import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PostgresService } from './postgres/postgres.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const postgres = app.get(PostgresService);
  await postgres.setup();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
