import Joi from 'joi';

export class CreateCommentDto {
  public text: string;
  public rating: number;
  public offerId: string;
  public userId: string;

  constructor(
    text: string,
    rating: number,
    offerId: string,
    userId: string
  ) {
    this.text = text;
    this.rating = rating;
    this.offerId = offerId;
    this.userId = userId;
  }
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
    }),

  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
      'any.required': 'User ID is required'
    })
});
