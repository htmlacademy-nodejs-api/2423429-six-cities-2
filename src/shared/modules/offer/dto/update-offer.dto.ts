import { Expose } from 'class-transformer';
import Joi from 'joi';

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
  public conveniences?: string[];

  @Expose()
  public location?: {
    latitude: number;
    longitude: number;
  };
}

export const updateOfferSchema = Joi.object({
  title: Joi.string().min(10).max(100),
  description: Joi.string().min(20).max(1024),
  city: Joi.string(),
  previewImage: Joi.string(),
  images: Joi.array().items(Joi.string()),
  isPremium: Joi.boolean(),
  type: Joi.string().valid('apartment', 'house', 'room', 'hotel'),
  bedrooms: Joi.number().integer().min(1).max(8),
  maxAdults: Joi.number().integer().min(1).max(10),
  price: Joi.number().integer().min(100).max(100000),
  goods: Joi.array().items(Joi.string()),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  })
});
