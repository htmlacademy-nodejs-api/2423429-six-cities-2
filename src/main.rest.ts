import { PinoLogger } from './shared/libs/logger/pino.logger.js';
import { RestApplication } from './rest/rest.application.js';

async function bootstrap() {
  const logger = new PinoLogger();

  const application = new RestApplication(logger);
  await application.init();
}

bootstrap();
