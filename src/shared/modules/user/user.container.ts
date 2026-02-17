// src/shared/modules/user/user.container.ts
import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';
import { Component } from '../../types/index.js';
import { UserEntity, UserModel } from './user.entity.js';
import { UserService } from './user-service.interface.js';
import { DefaultUserService } from './user.service.js';
import { UserController } from './user.controller.js';

export function createUserContainer() {
  const userContainer = new Container();

  userContainer.bind<UserService>(Component.UserService)
    .to(DefaultUserService)
    .inSingletonScope();

  userContainer.bind<types.ModelType<UserEntity>>(Component.UserModel)
    .toConstantValue(UserModel);

  userContainer.bind<UserController>(Component.UserController)
    .to(UserController)
    .inSingletonScope();

  return userContainer;
}
