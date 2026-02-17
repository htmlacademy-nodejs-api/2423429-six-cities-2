import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/index.js';
import { OfferResponseDto } from './rdo/offer-response.rdo.js';
import { OfferService } from './offer-service.interface.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { plainToInstance } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { HttpError } from '../../libs/rest/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

@injectable()
export class OfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService
  ) {
    super(logger);

    // GET /offers - все предложения
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Get,
      handler: this.getOffers,
    });


    // GET /offers/premium/:city - премиальные предложения по городу
    this.addRoute({
      path: '/offers/premium/:city',
      method: HttpMethod.Get,
      handler: this.getPremiumOffers,
    });

    // GET /offers/favorites - избранные предложения
    this.addRoute({
      path: '/offers/favorites/',
      method: HttpMethod.Get,
      handler: this.getFavoriteOffers,
    });

    // POST /offers/:id/favorite - добавить в избранное
    this.addRoute({
      path: '/offers/:id/favorite',
      method: HttpMethod.Post,
      handler: this.addToFavorite,
    });

    // DELETE /offers/:id/favorite - удалить из избранного
    this.addRoute({
      path: '/offers/:id/favorite',
      method: HttpMethod.Delete,
      handler: this.removeFromFavorite,
    });

    // GET /offers/:id - конкретное предложение
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Get,
      handler: this.getOfferById,
    });

    // POST /offers - создать предложение
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Post,
      handler: this.createOffer,
    });

    // PATCH /offers/:id - обновить предложение
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Patch,
      handler: this.updateOffer,
    });

    // DELETE /offers/:id - удалить предложение
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Delete,
      handler: this.deleteOffer,
    });
  }

  private getOffers = asyncHandler(async (_req: Request, res: Response) => {
    const offers = await this.offerService.findAll();

    const offersResponse = offers.map((offer) =>
      plainToInstance(OfferResponseDto, offer.toObject(), {
        excludeExtraneousValues: true,
      })
    );

    this.ok(res, offersResponse);
  });

  private getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        { offerId }
      );
    }

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, offerResponse);
  });

  private getPremiumOffers = asyncHandler(async (req: Request, res: Response) => {
    const city = req.params.city.toString();
    const limit = parseInt(req.query.limit as string, 10) || 3;

    const offers = await this.offerService.findPremiumByCity(city, limit);
    const offersResponse = offers.map((offer) =>
      plainToInstance(OfferResponseDto, offer.toObject(), {
        excludeExtraneousValues: true,
      })
    );

    this.ok(res, offersResponse);
  });

  private getFavoriteOffers = asyncHandler(async (_req: Request, res: Response) => {
    const offers = await this.offerService.findFavorites();
    const offersResponse = offers.map((offer) =>
      plainToInstance(OfferResponseDto, offer.toObject(), {
        excludeExtraneousValues: true,
      })
    );


    this.ok(res, offersResponse);
  });

  private addToFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    const offer = await this.offerService.toggleFavorite(offerId, true);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        { offerId }
      );
    }

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, offerResponse);
  });

  private removeFromFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    const offer = await this.offerService.toggleFavorite(offerId, false);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        { offerId }
      );
    }

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, offerResponse);
  });

  private createOffer = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, city, previewImage, images, isPremium, type, bedrooms, maxAdults, price, goods, hostId, location } = req.body;

    // Проверяем обязательные поля
    if (!title || !description || !city || !previewImage || !type || !bedrooms || !maxAdults || !price || !hostId || !location) {
      const missingFields = {
        title: !title,
        description: !description,
        city: !city,
        previewImage: !previewImage,
        type: !type,
        bedrooms: !bedrooms,
        maxAdults: !maxAdults,
        price: !price,
        hostId: !hostId,
        location: !location
      };

      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Missing required fields for offer creation',
        { missingFields }
      );
    }

    const createOfferDto = Object.assign(new CreateOfferDto(), {
      title,
      description,
      postDate: new Date(),
      city,
      previewImage,
      images: images || [],
      isPremium: Boolean(isPremium),
      isFavorite: false,
      rating: 0,
      type,
      rooms: Number(bedrooms),
      guests: Number(maxAdults),
      price: Number(price),
      conveniences: goods || [],
      host: hostId,
      location
    });

    const offer = await this.offerService.create(createOfferDto);

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    this.created(res, offerResponse);
  });

  private updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();

    const updateOfferDto = Object.assign(new UpdateOfferDto(), req.body);
    const offer = await this.offerService.updateById(offerId, updateOfferDto);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        { offerId }
      );
    }

    const offerResponse = plainToInstance(OfferResponseDto, offer.toObject(), {
      excludeExtraneousValues: true,
    });

    this.ok(res, offerResponse);
  });

  private deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    const offer = await this.offerService.deleteById(offerId);

    if (!offer) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with id ${offerId} not found`,
        { offerId }
      );
    }

    this.noContent<void>(res, undefined as void);
  });
}
