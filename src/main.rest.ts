import 'reflect-metadata';
import { RestApplication } from './shared/libs/rest/rest.application.js';
import { Container } from 'inversify';
import { Component } from './shared/types/index.js';
import { createRestApplicationContainer } from './shared/libs/rest/rest.container.js';
import { createUserContainer } from './shared/modules/user/index.js';
import { createOfferContainer } from './shared/modules/offer/index.js';


async function bootstrap() {
  const appContainer = Container.merge(
    createRestApplicationContainer(),
    createUserContainer(),
    createOfferContainer(),
  );

  const application = appContainer.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
