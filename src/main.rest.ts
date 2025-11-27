import { PinoLogger } from './shared/libs/logger/index.js';
import { RestApplication } from './rest/rest.application.js';
import { RestConfig } from './shared/libs/config/rest.config.js';

async function bootstrap() {
  const logger = new PinoLogger();
  const config = new RestConfig(logger);

  const application = new RestApplication(logger, config);
  await application.init();
}

bootstrap();
