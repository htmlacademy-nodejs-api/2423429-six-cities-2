import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BaseController } from '../../libs/rest/controller/base-controller.abstract.js';
import { Logger } from '../../libs/logger/index.js';
import { HttpMethod } from '../../libs/rest/index.js';
import { OfferResponseDto } from './index.js';

export class OfferController extends BaseController {
  constructor(
    protected readonly logger: Logger
  ) {
    super(logger);

    // GET /offers - все предложения
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Get,
      handler: this.getOffers,
    });

    // GET /offers/:id - конкретное предложение
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Get,
      handler: this.getOfferById,
    });

    // GET /offers/premium/:city - премиальные предложения по городу
    this.addRoute({
      path: '/offers/premium/:city',
      method: HttpMethod.Get,
      handler: this.getPremiumOffers,
    });

    // GET /offers/favorites - избранные предложения
    this.addRoute({
      path: '/offers/favorites',
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
    const mockOffer: OfferResponseDto = {
      id: '1',
      title: 'Test Offer',
      description: 'Test Description',
      date: new Date(),
      city: 'Paris',
      previewImage: 'https://example.com/preview.jpg',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      isPremium: true,
      isFavorite: false,
      rating: 4.5,
      type: 'apartment',
      bedrooms: 2,
      maxAdults: 4,
      price: 150,
      goods: ['Wi-Fi', 'Kitchen', 'Heating'],
      hostId: 'user-1',
      location: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    this.ok(res, [mockOffer]);
  });

  private getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    const mockOffer: OfferResponseDto = {
      id: offerId,
      title: 'Test Offer',
      description: 'Test Description',
      date: new Date(),
      city: 'Paris',
      previewImage: 'https://example.com/preview.jpg',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      isPremium: true,
      isFavorite: false,
      rating: 4.5,
      type: 'apartment',
      bedrooms: 2,
      maxAdults: 4,
      price: 150,
      goods: ['Wi-Fi', 'Kitchen', 'Heating'],
      hostId: 'user-1',
      location: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    this.ok(res, mockOffer);
  });

  private getPremiumOffers = asyncHandler(async (req: Request, res: Response) => {
    const city = req.params.city.toString();
    const mockOffer: OfferResponseDto = {
      id: 'premium-1',
      title: `Premium Offer in ${ city}`,
      description: 'Luxury premium accommodation',
      date: new Date(),
      city: city,
      previewImage: 'https://example.com/premium.jpg',
      images: ['https://example.com/premium1.jpg', 'https://example.com/premium2.jpg'],
      isPremium: true,
      isFavorite: true,
      rating: 4.9,
      type: 'house',
      bedrooms: 4,
      maxAdults: 8,
      price: 500,
      goods: ['Wi-Fi', 'Kitchen', 'Heating', 'Pool', 'Garden', 'Parking'],
      hostId: 'premium-host-1',
      location: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    this.ok(res, [mockOffer]);
  });

  private getFavoriteOffers = asyncHandler(async (_req: Request, res: Response) => {
    const mockOffer: OfferResponseDto = {
      id: 'favorite-1',
      title: 'Favorite Offer',
      description: 'My favorite place to stay',
      date: new Date(),
      city: 'Amsterdam',
      previewImage: 'https://example.com/favorite.jpg',
      images: ['https://example.com/fav1.jpg', 'https://example.com/fav2.jpg'],
      isPremium: true,
      isFavorite: true,
      rating: 4.8,
      type: 'apartment',
      bedrooms: 3,
      maxAdults: 6,
      price: 300,
      goods: ['Wi-Fi', 'Kitchen', 'Heating', 'TV', 'Washer'],
      hostId: 'user-1',
      location: {
        latitude: 52.3676,
        longitude: 4.9041
      }
    };

    this.ok(res, [mockOffer]);
  });

  private addToFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    this.logger.info(`Offer ${offerId} added to favorites`);

    const mockOffer: OfferResponseDto = {
      id: offerId,
      title: 'Updated Favorite Offer',
      description: 'Test Description',
      date: new Date(),
      city: 'Paris',
      previewImage: 'https://example.com/preview.jpg',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      isPremium: true,
      isFavorite: true, // Теперь true
      rating: 4.5,
      type: 'apartment',
      bedrooms: 2,
      maxAdults: 4,
      price: 150,
      goods: ['Wi-Fi', 'Kitchen', 'Heating'],
      hostId: 'user-1',
      location: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    this.ok(res, mockOffer);
  });

  private removeFromFavorite = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    this.logger.info(`Offer ${offerId} removed from favorites`);

    const mockOffer: OfferResponseDto = {
      id: offerId,
      title: 'Updated Non-Favorite Offer',
      description: 'Test Description',
      date: new Date(),
      city: 'Paris',
      previewImage: 'https://example.com/preview.jpg',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      isPremium: true,
      isFavorite: false, // Теперь false
      rating: 4.5,
      type: 'apartment',
      bedrooms: 2,
      maxAdults: 4,
      price: 150,
      goods: ['Wi-Fi', 'Kitchen', 'Heating'],
      hostId: 'user-1',
      location: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    this.ok(res, mockOffer);
  });

  private createOffer = asyncHandler(async (req: Request, res: Response) => {
    const mockOffer: OfferResponseDto = {
      id: 'new-id',
      title: req.body.title || 'New Offer',
      description: req.body.description || 'New Description',
      date: new Date(),
      city: req.body.city || 'Amsterdam',
      previewImage: req.body.previewImage || 'https://example.com/default.jpg',
      images: req.body.images || [],
      isPremium: req.body.isPremium || false,
      isFavorite: false,
      rating: 0,
      type: req.body.type || 'room',
      bedrooms: req.body.bedrooms || 1,
      maxAdults: req.body.maxAdults || 2,
      price: req.body.price || 100,
      goods: req.body.goods || [],
      hostId: req.body.hostId || 'user-1',
      location: req.body.location || {
        latitude: 52.3676,
        longitude: 4.9041
      }
    };

    this.created(res, mockOffer);
  });

  private updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id.toString();
    const mockOffer: OfferResponseDto = {
      id: offerId,
      title: req.body.title || 'Updated Offer',
      description: req.body.description || 'Updated Description',
      date: new Date(),
      city: req.body.city || 'Paris',
      previewImage: req.body.previewImage || 'https://example.com/updated.jpg',
      images: req.body.images || [],
      isPremium: req.body.isPremium || true,
      isFavorite: req.body.isFavorite || false,
      rating: 4.8,
      type: req.body.type || 'apartment',
      bedrooms: req.body.bedrooms || 3,
      maxAdults: req.body.maxAdults || 6,
      price: req.body.price || 200,
      goods: req.body.goods || ['Wi-Fi', 'Kitchen', 'Heating', 'TV'],
      hostId: req.body.hostId || 'user-1',
      location: req.body.location || {
        latitude: 48.8566,
        longitude: 2.3522
      }
    };

    this.ok(res, mockOffer);
  });

  private deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerId = req.params.id;
    this.logger.info(`Offer deleted: ${offerId}`);
    this.noContent<void>(res, undefined as void);
  });
}
