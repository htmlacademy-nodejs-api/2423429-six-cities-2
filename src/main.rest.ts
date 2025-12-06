import 'reflect-metadata';
import { RestApplication } from './rest/rest.application.js';
import { Container } from 'inversify';
import { Component } from './shared/types/index.js';
import { createRestApplicationContainer } from './rest/rest.container.js';
import { createUserContainer } from './shared/modules/user/index.js';
import { createCategoryContainer } from './shared/modules/category/category.container.js';
import { createOfferContainer } from './shared/modules/offer/index.js';


async function bootstrap() {
  const appContainer = Container.merge(
    createRestApplicationContainer(),
    createUserContainer(),
    createCategoryContainer(),
    createOfferContainer(),
  );

  const application = appContainer.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
