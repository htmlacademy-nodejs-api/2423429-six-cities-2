import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/index.js';
import { OfferResponseDto } from './rdo/offer-response.rdo.js';
import { OfferService } from './offer-service.interface.js';
import { CreateOfferDto, createOfferSchema } from './dto/create-offer.dto.js';
import { UpdateOfferDto, updateOfferSchema } from './dto/update-offer.dto.js';
import { plainToInstance } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { CommentService } from '../comment/comment-service.interface.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../libs/rest/middleware/validate-objectid.middleware.js';
import { DocumentExistsMiddleware } from '../../libs/rest/middleware/document-exists.middleware.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { UploadFileMiddleware } from '../../libs/rest/middleware/upload-file.middleware.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
     @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {
    super(logger);

    this.logger.info('OfferController initialized');

    // GET /offers - all offers
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Get,
      handler: this.getOffers,
    });

    // GET /offers/premium/:city - premium offers by city
    this.addRoute({
      path: '/offers/premium/:city',
      method: HttpMethod.Get,
      handler: this.getPremiumOffers,
    });

    // GET /offers/favorites - favorite offers
    this.addRoute({
      path: '/offers/favorites',
      method: HttpMethod.Get,
      handler: this.getFavoriteOffers,
    });

    // POST /offers/:id/favorite - add to favorites
    this.addRoute({
      path: '/offers/:id/favorite',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    // DELETE /offers/:id/favorite - remove from favorites
    this.addRoute({
      path: '/offers/:id/favorite',
      method: HttpMethod.Delete,
      handler: this.removeFromFavorite,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    // GET /offers/:id - get offer by id
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Get,
      handler: this.getOfferById,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    // GET /offers/:id/comments - get comments for offer
    this.addRoute({
      path: '/offers/:id/comments',
      method: HttpMethod.Get,
      handler: this.getOfferComments,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    // POST /offers - create offer
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Post,
      handler: this.createOffer,
      middlewares: [new ValidateDtoMiddleware(createOfferSchema)]
    });

    // PATCH /offers/:id - update offer
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Patch,
      handler: this.updateOffer,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id'),
        new ValidateDtoMiddleware(updateOfferSchema)
      ]
    });

    // DELETE /offers/:id - delete offer
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Delete,
      handler: this.deleteOffer,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    this.addRoute({
      path: '/offers/:id/images',
      method: HttpMethod.Post,
      handler: this.uploadImages,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id'),
        new UploadFileMiddleware(
          this.config.get('UPLOAD_DIRECTORY'),
          'images', // поле для нескольких файлов
          10 * 1024 * 1024 // 10MB для нескольких изображений
        )
      ]
    });
  }

  private getOffers = asyncHandler(async (_req: Request, res: Response) => {
    const offers = await this.offerService.findAll();

    const offersResponse = await Promise.all(
      offers.map(async (offer) => {
        const offerDto = plainToInstance(OfferResponseDto, offer.toObject(), {
          excludeExtraneousValues: true,
        });

        // Добавляем статистику комментариев
        const commentsCount = await this.commentService.countByOfferId(offer.id);
        const averageRating = await this.commentService.getAverageRating(offer.id);

        return {
          ...offerDto,
          commentsCount,
          rating: averageRating || 0
        };
      })
    );

    this.ok(res, offersResponse);
  });

  private getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const offer = await this.offerService.findById(offerId);

    const offerResponse = plainToInstance(OfferResponseDto, offer?.toObject(), {
      excludeExtraneousValues: true,
    });

    // Добавляем статистику комментариев
    const commentsCount = await this.commentService.countByOfferId(offerId);
    const averageRating = await this.commentService.getAverageRating(offerId);

    this.ok(res, {
      ...offerResponse,
      commentsCount,
      rating: averageRating || 0
    });
  });

  private getPremiumOffers = asyncHandler(async (req: Request, res: Response) => {
    const city = req.params.city as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;

    const offers = await this.offerService.findPremiumByCity(city, limit);

    const offersResponse = await Promise.all(
      offers.map(async (offer) => {
        const offerDto = plainToInstance(OfferResponseDto, offer.toObject(), {
          excludeExtraneousValues: true,
        });

        const commentsCount = await this.commentService.countByOfferId(offer.id);
        const averageRating = await this.commentService.getAverageRating(offer.id);

        return {
          ...offerDto,
          commentsCount,
          rating: averageRating || 0
        };
      })
    );

    this.ok(res, offersResponse);
  });

  private getFavoriteOffers = asyncHandler(async (_req: Request, res: Response) => {
    const offers = await this.offerService.findFavorites();

    const offersResponse = await Promise.all(
      offers.map(async (offer) => {
        const offerDto = plainToInstance(OfferResponseDto, offer.toObject(), {
          excludeExtraneousValues: true,
        });

        const commentsCount = await this.commentService.countByOfferId(offer.id);
        const averageRating = await this.commentService.getAverageRating(offer.id);

        return {
          ...offerDto,
          commentsCount,
          rating: averageRating || 0
        };
      })
    );

    this.ok(res, offersResponse);
  });

  private addToFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const offer = await this.offerService.toggleFavorite(offerId, true);

    const offerResponse = plainToInstance(OfferResponseDto, offer?.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, offerResponse);
  });

  private removeFromFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const offer = await this.offerService.toggleFavorite(offerId, false);

    const offerResponse = plainToInstance(OfferResponseDto, offer?.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, offerResponse);
  });

  private getOfferComments = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const comments = await this.commentService.findByOfferId(offerId);

    this.ok(res, comments);
  });

  private createOffer = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateOfferDto;

    if (!dto.host) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Host ID is required for offer creation'
      );
    }

    const offer = await this.offerService.create(dto);

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, {
      ...offerResponse,
      commentsCount: 0,
      rating: 0
    });
  });

  private updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const dto = req.body as UpdateOfferDto;

    const offer = await this.offerService.updateById(offerId, dto);

    const offerResponse = plainToInstance(OfferResponseDto, offer?.toObject(), {
      excludeExtraneousValues: true,
    });

    // Добавляем актуальную статистику комментариев
    const commentsCount = await this.commentService.countByOfferId(offerId);
    const averageRating = await this.commentService.getAverageRating(offerId);

    this.ok(res, {
      ...offerResponse,
      commentsCount,
      rating: averageRating || 0
    });
  });

  private deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;

    // Сначала удаляем все комментарии к предложению
    await this.commentService.deleteByOfferId(offerId);

    // Затем удаляем само предложение
    await this.offerService.deleteById(offerId);

    this.noContent(res);
  });

  // Добавить метод uploadImages
  private uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'No images uploaded'
      );
    }

    // Формируем URLs для загруженных изображений
    const imageUrls = files.map((file) => `/static/${file.filename}`);

    // Получаем текущее предложение
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`
      );
    }

    // Добавляем новые изображения к существующим
    const updatedImages = [...offer.images, ...imageUrls];

    // Обновляем предложение
    const updatedOffer = await this.offerService.updateById(offerId, {
      images: updatedImages
    });

    const offerResponse = plainToInstance(OfferResponseDto, updatedOffer?.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, {
      success: true,
      offer: offerResponse,
      uploadedImages: imageUrls,
      message: `${files.length} image(s) uploaded successfully`
    });
  });
}
