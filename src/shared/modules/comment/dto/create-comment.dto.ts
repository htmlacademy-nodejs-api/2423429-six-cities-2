import Joi from 'joi';
import { Expose } from 'class-transformer';

export class CreateCommentDto {
  @Expose()
  public text!: string;

  @Expose()
  public rating!: number;

  // userId и offerId удалены - они будут браться из токена и URL
}

export const createCommentSchema = Joi.object({
  text: Joi.string()
    .min(5)
    .max(1024)
    .required()
    .messages({
      'string.min': 'Text must be at least 5 characters long',
      'string.max': 'Text cannot exceed 1024 characters',
      'any.required': 'Text is required'
    }),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be an integer',
      'number.min': 'Minimum rating is 1',
      'number.max': 'Maximum rating is 5',
      'any.required': 'Rating is required'
    })
});
