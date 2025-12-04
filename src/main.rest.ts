import 'reflect-metadata';
import { Logger, PinoLogger } from './shared/libs/logger/index.js';
import { RestApplication } from './rest/rest.application.js';
import { RestConfig } from './shared/libs/config/rest.config.js';
import { Container } from 'inversify';
import { Component } from './shared/types/index.js';
import { Config, RestSchema } from './shared/libs/config/index.js';
import { DatabaseClient, MongoDatabaseClient } from './shared/libs/database-client/index.js';

async function bootstrap() {
  const container = new Container();
  container.bind<RestApplication>(Component.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  container.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();

  const application = container.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
