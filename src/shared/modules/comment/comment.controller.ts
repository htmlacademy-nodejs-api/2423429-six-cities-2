// src/shared/modules/comment/comment.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { injectable, inject } from 'inversify';
import { Component } from '../../types/index.js';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/types/http-method.enum.js';
import { CommentService } from './comment-service.interface.js';
import { CreateCommentDto, createCommentSchema } from './dto/create-comment.dto.js';
import { plainToInstance } from 'class-transformer';
import { ValidateObjectIdMiddleware } from '../../libs/rest/middleware/validate-objectid.middleware.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { CommentResponseDto } from './rdo/comment-response.rdo.js';

@injectable()
export class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService
  ) {
    super(logger);

    console.log('CommentController initialized!!!');

    // GET /offers/:offerId/comments - получить комментарии к предложению
    this.addRoute({
      path: '/offers/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.getCommentsByOfferId,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId')
      ]
    });

    // POST /offers/:offerId/comments - добавить комментарий
    this.addRoute({
      path: '/offers/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.createComment,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(createCommentSchema)
      ]
    });
  }

  private getCommentsByOfferId = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.offerId as string;

    this.logger.info(`GET /offers/${offerId}/comments`);

    const comments = await this.commentService.findByOfferId(offerId);

    const commentsResponse = comments.map((comment) =>
      plainToInstance(CommentResponseDto, comment.toObject(), {
        excludeExtraneousValues: true,
      })
    );

    this.ok(res, commentsResponse);
  });

  private createComment = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.offerId as string;
    const dto = req.body as CreateCommentDto;

    this.logger.info(`POST /offers/${offerId}/comments`);

    // Проверяем существование предложения
    const offerExists = await this.commentService.checkOfferExists(offerId);
    if (!offerExists) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`
      );
    }

    // Создаем комментарий - передаем один объект со всеми полями
    const comment = await this.commentService.create({
      text: dto.text,
      rating: dto.rating,
      userId: dto.userId,
      offerId: offerId
    });

    const commentResponse = plainToInstance(CommentResponseDto, comment.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, commentResponse);
  });
}
