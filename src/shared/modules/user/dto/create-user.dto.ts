import Joi from 'joi';
import { UserType } from '../../../types/index.js';

export class CreateUserDto {
  public name: string;
  public email: string;
  public avatar?: string;
  public password: string;
  public type: UserType;

  constructor(
    name: string,
    email: string,
    password: string,
    type: UserType,
    avatar?: string
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.type = type;
    this.avatar = avatar;
  }
}

export const createUserSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(15)
    .required()
    .messages({
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 15 characters',
      'any.required': 'Name is required'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(6)
    .max(12)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 12 characters',
      'any.required': 'Password is required'
    }),

  type: Joi.string()
    .valid('common', 'pro')
    .required()
    .messages({
      'any.only': 'Type must be either "common" or "pro"',
      'any.required': 'Type is required'
    }),

  avatar: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Avatar must be a string'
    })
});
