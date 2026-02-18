import { Expose } from 'class-transformer';
import Joi from 'joi';
import { City, HousingType, Convenience } from '../../../types/index.js';

const cityValues = Object.values(City);
const housingTypeValues = Object.values(HousingType);
const convenienceValues = Object.values(Convenience);

export class CreateOfferDto {
  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  public city!: string;

  @Expose()
  public previewImage!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string;

  @Expose()
  public rooms!: number;

  @Expose()
  public guests!: number;

  @Expose()
  public price!: number;

  @Expose()
  public conveniences!: string[];

  @Expose()
  public host!: string;

  @Expose()
  public location!: {
    latitude: number;
    longitude: number;
  };
}

export const createOfferSchema = Joi.object({
  title: Joi.string()
    .min(10)
    .max(100)
    .required()
    .messages({
      'string.min': 'Title must be at least 10 characters long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .min(20)
    .max(1024)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description cannot exceed 1024 characters',
      'any.required': 'Description is required'
    }),

  city: Joi.string()
    .valid(...cityValues)
    .required()
    .messages({
      'any.only': `City must be one of: ${cityValues.join(', ')}`,
      'any.required': 'City is required'
    }),

  previewImage: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Preview image must be a valid URL',
      'any.required': 'Preview image is required'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .length(6)
    .required()
    .messages({
      'array.length': 'Images must contain exactly 6 items',
      'any.required': 'Images are required'
    }),

  isPremium: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'isPremium must be a boolean',
      'any.required': 'isPremium is required'
    }),

  type: Joi.string()
    .valid(...housingTypeValues)
    .required()
    .messages({
      'any.only': `Type must be one of: ${housingTypeValues.join(', ')}`,
      'any.required': 'Type is required'
    }),

  bedrooms: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .required()
    .messages({
      'number.base': 'Bedrooms must be a number',
      'number.integer': 'Bedrooms must be an integer',
      'number.min': 'Minimum bedrooms is 1',
      'number.max': 'Maximum bedrooms is 8',
      'any.required': 'Bedrooms is required'
    }),

  maxAdults: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      'number.base': 'Max adults must be a number',
      'number.integer': 'Max adults must be an integer',
      'number.min': 'Minimum max adults is 1',
      'number.max': 'Maximum max adults is 10',
      'any.required': 'Max adults is required'
    }),

  price: Joi.number()
    .integer()
    .min(100)
    .max(100000)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.integer': 'Price must be an integer',
      'number.min': 'Minimum price is 100',
      'number.max': 'Maximum price is 100000',
      'any.required': 'Price is required'
    }),

  goods: Joi.array()
    .items(Joi.string().valid(...convenienceValues))
    .min(1)
    .required()
    .messages({
      'array.min': 'Goods must contain at least 1 item',
      'any.required': 'Goods are required',
      'any.only': `Goods must be from: ${convenienceValues.join(', ')}`
    }),

  host: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Host ID must be a valid MongoDB ObjectId',
      'any.required': 'Host ID is required'
    }),

  location: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
      }),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
      })
  }).required()
});
