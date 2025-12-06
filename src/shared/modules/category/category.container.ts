import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';
import { Component } from '../../types/index.js';
import { CategoryService } from './category-service.interface.js';
import { CategoryEntity, CategoryModel } from './category.entity.js';
import { DefaultCategoryService } from './category.service.js';

export function createCategoryContainer() {
  const categoryContainer = new Container();

  categoryContainer.bind<CategoryService>(Component.CategoryService).to(DefaultCategoryService);
  categoryContainer.bind<types.ModelType<CategoryEntity>>(Component.CategoryModel).toConstantValue(CategoryModel);

  return categoryContainer;
}
