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
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';
import { FavoriteService } from '../favorite/favorite-service.interface.js';
import '../../types/request.type.js';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.FavoriteService) private readonly favoriteService: FavoriteService,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.PrivateRouteMiddleware) private readonly privateRouteMiddleware: PrivateRouteMiddleware
  ) {
    super(logger);

    this.logger.info('OfferController initialized');

    // PUBLIC ROUTES
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Get,
      handler: this.getOffers,
    });

    this.addRoute({
      path: '/offers/premium/:city',
      method: HttpMethod.Get,
      handler: this.getPremiumOffers,
    });

    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Get,
      handler: this.getOfferById,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    this.addRoute({
      path: '/offers/:id/comments',
      method: HttpMethod.Get,
      handler: this.getOfferComments,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    // PRIVATE ROUTES
    this.addRoute({
      path: '/offers/favorites',
      method: HttpMethod.Get,
      handler: this.getFavoriteOffers,
      middlewares: [this.privateRouteMiddleware]
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    this.addRoute({
      path: '/offers/:id/favorite',
      method: HttpMethod.Delete,
      handler: this.removeFromFavorite,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    this.addRoute({
      path: '/offers',
      method: HttpMethod.Post,
      handler: this.createOffer,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateDtoMiddleware(createOfferSchema)
      ]
    });

    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Patch,
      handler: this.updateOffer,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id'),
        new ValidateDtoMiddleware(updateOfferSchema)
      ]
    });

    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Delete,
      handler: this.deleteOffer,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id')
      ]
    });

    this.addRoute({
      path: '/offers/:id/images',
      method: HttpMethod.Post,
      handler: this.uploadImages,
      middlewares: [
        this.privateRouteMiddleware,
        new ValidateObjectIdMiddleware('id'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'id'),
        new UploadFileMiddleware(
          this.config.get('UPLOAD_DIRECTORY'),
          'images',
          10 * 1024 * 1024
        )
      ]
    });
  }

  private getOffers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const offers = await this.offerService.findAll();

    const offersResponse = await Promise.all(
      offers.map(async (offer) => {
        const offerDto = plainToInstance(OfferResponseDto, offer.toObject(), {
          excludeExtraneousValues: true,
        });

        const commentsCount = await this.commentService.countByOfferId(offer.id);
        const averageRating = await this.commentService.getAverageRating(offer.id);
        const isFavorite = userId ? await this.favoriteService.isFavorite(userId, offer.id) : false;

        return {
          ...offerDto,
          commentsCount,
          rating: averageRating || 0,
          isFavorite
        };
      })
    );

    this.ok(res, offersResponse);
  });

  private getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const userId = req.user?.userId;
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        'OfferController'
      );
    }

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    const commentsCount = await this.commentService.countByOfferId(offerId);
    const averageRating = await this.commentService.getAverageRating(offerId);
    const isFavorite = userId ? await this.favoriteService.isFavorite(userId, offerId) : false;

    this.ok(res, {
      ...offerResponse,
      commentsCount,
      rating: averageRating || 0,
      isFavorite
    });
  });

  private getPremiumOffers = asyncHandler(async (req: Request, res: Response) => {
    const city = req.params.city as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
    const userId = req.user?.userId;

    const offers = await this.offerService.findPremiumByCity(city, limit);

    const offersResponse = await Promise.all(
      offers.map(async (offer) => {
        const offerDto = plainToInstance(OfferResponseDto, offer.toObject(), {
          excludeExtraneousValues: true,
        });

        const commentsCount = await this.commentService.countByOfferId(offer.id);
        const averageRating = await this.commentService.getAverageRating(offer.id);
        const isFavorite = userId ? await this.favoriteService.isFavorite(userId, offer.id) : false;

        return {
          ...offerDto,
          commentsCount,
          rating: averageRating || 0,
          isFavorite
        };
      })
    );

    this.ok(res, offersResponse);
  });

  private getOfferComments = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const comments = await this.commentService.findByOfferId(offerId);

    this.ok(res, comments);
  });

  private getFavoriteOffers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const favoriteOffers = await this.favoriteService.findByUserId(userId);

    const offersResponse = await Promise.all(
      favoriteOffers.map(async (offer) => {
        const offerDto = plainToInstance(OfferResponseDto, offer.toObject(), {
          excludeExtraneousValues: true,
        });

        const commentsCount = await this.commentService.countByOfferId(offer.id);
        const averageRating = await this.commentService.getAverageRating(offer.id);

        return {
          ...offerDto,
          commentsCount,
          rating: averageRating || 0,
          isFavorite: true
        };
      })
    );

    this.ok(res, offersResponse);
  });

  private addToFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    await this.favoriteService.add(userId, offerId);

    this.ok(res, {
      success: true,
      message: 'Offer added to favorites'
    });
  });

  private removeFromFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    await this.favoriteService.remove(userId, offerId);

    this.ok(res, {
      success: true,
      message: 'Offer removed from favorites'
    });
  });

  private createOffer = asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateOfferDto;
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offer = await this.offerService.create({
      ...dto,
      host: userId
    });

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    const commentsCount = await this.commentService.countByOfferId(offer.id);
    const averageRating = await this.commentService.getAverageRating(offer.id);

    this.created(res, {
      ...offerResponse,
      commentsCount,
      rating: averageRating || 0,
      isFavorite: false
    });
  });

  private updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const dto = req.body as UpdateOfferDto;
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        'OfferController'
      );
    }

    if (offer.host.toString() !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only update your own offers',
        'OfferController'
      );
    }

    const updatedOffer = await this.offerService.updateById(offerId, dto);

    const offerResponse = plainToInstance(OfferResponseDto, updatedOffer?.toObject(), {
      excludeExtraneousValues: true,
    });

    const commentsCount = await this.commentService.countByOfferId(offerId);
    const averageRating = await this.commentService.getAverageRating(offerId);
    const isFavorite = userId ? await this.favoriteService.isFavorite(userId, offerId) : false;

    this.ok(res, {
      ...offerResponse,
      commentsCount,
      rating: averageRating || 0,
      isFavorite
    });
  });

  private deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        'OfferController'
      );
    }

    if (offer.host.toString() !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only delete your own offers',
        'OfferController'
      );
    }

    await this.commentService.deleteByOfferId(offerId);
    await this.favoriteService.removeByOfferId(offerId);
    await this.offerService.deleteById(offerId);

    this.noContent(res);
  });

  private uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id as string;
    const files = req.files as Express.Multer.File[];
    const userId = req.user?.userId;

    if (!files || files.length === 0) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'No images uploaded'
      );
    }

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not authenticated',
        'OfferController'
      );
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`
      );
    }

    if (offer.host.toString() !== userId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only update images for your own offers',
        'OfferController'
      );
    }

    const imageUrls = files.map((file) => `/static/${file.filename}`);
    const updatedImages = [...offer.images, ...imageUrls];

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
