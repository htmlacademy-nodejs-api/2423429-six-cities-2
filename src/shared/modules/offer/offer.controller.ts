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

    // GET /offers
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Get,
      handler: this.getOffers,
    });

    // GET /offers/:id
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Get,
      handler: this.getOfferById,
    });

    // POST /offers
    this.addRoute({
      path: '/offers',
      method: HttpMethod.Post,
      handler: this.createOffer,
    });

    // PATCH /offers/:id
    this.addRoute({
      path: '/offers/:id',
      method: HttpMethod.Patch,
      handler: this.updateOffer,
    });

    // DELETE /offers/:id
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
