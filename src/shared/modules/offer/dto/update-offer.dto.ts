import { Expose } from 'class-transformer';
import Joi from 'joi';
import { City, ConveniencesType, HousingType, } from '../../../types/index.js';

const cityValues = Object.values(City);
const housingTypeValues = Object.values(HousingType);
const goodsValues = Object.values(ConveniencesType);

export class UpdateOfferDto {
  @Expose()
  public title?: string;

  @Expose()
  public description?: string;

  @Expose()
  public city?: string;

  @Expose()
  public previewImage?: string;

  @Expose()
  public images?: string[];

  @Expose()
  public isPremium?: boolean;

  @Expose()
  public isFavorite?: boolean;

  @Expose()
  public rating?: number;

  @Expose()
  public type?: string;

  @Expose()
  public rooms?: number;

  @Expose()
  public guests?: number;

  @Expose()
  public price?: number;

  @Expose()
  public goods?: string[];

  @Expose()
  public location?: {
    latitude: number;
    longitude: number;
  };
}

export const updateOfferSchema = Joi.object({
  title: Joi.string()
    .min(10)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Title must be at least 10 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),

  description: Joi.string()
    .min(20)
    .max(1024)
    .optional()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description cannot exceed 1024 characters'
    }),

  city: Joi.string()
    .valid(...cityValues)
    .optional()
    .messages({
      'any.only': `City must be one of: ${cityValues.join(', ')}`
    }),

  previewImage: Joi.string()
    .pattern(/\.(jpg|jpeg|png)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Preview image must be a valid image file (jpg, jpeg, png)'
    }),

  images: Joi.array()
    .items(Joi.string().pattern(/\.(jpg|jpeg|png)$/))
    .length(6)
    .optional()
    .messages({
      'array.length': 'Images must contain exactly 6 items'
    }),

  isPremium: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isPremium must be a boolean'
    }),

  isFavorite: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isFavorite must be a boolean'
    }),

  rating: Joi.number()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    }),

  type: Joi.string()
    .valid(...housingTypeValues)
    .optional()
    .messages({
      'any.only': `Type must be one of: ${housingTypeValues.join(', ')}`
    }),

  rooms: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      'number.base': 'Rooms must be a number',
      'number.integer': 'Rooms must be an integer',
      'number.min': 'Minimum rooms is 1',
      'number.max': 'Maximum rooms is 8'
    }),

  guests: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .optional()
    .messages({
      'number.base': 'Guests must be a number',
      'number.integer': 'Guests must be an integer',
      'number.min': 'Minimum guests is 1',
      'number.max': 'Maximum guests is 10'
    }),

  price: Joi.number()
    .integer()
    .min(100)
    .max(100000)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.integer': 'Price must be an integer',
      'number.min': 'Minimum price is 100',
      'number.max': 'Maximum price is 100000'
    }),

  goods: Joi.array()
    .items(Joi.string().valid(...goodsValues))
    .min(1)
    .optional()
    .messages({
      'array.min': 'Goods must contain at least 1 item',
      'any.only': `Goods must be from: ${goodsValues.join(', ')}`
    }),

  location: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
      }),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
      })
  }).optional()
}).min(1);
