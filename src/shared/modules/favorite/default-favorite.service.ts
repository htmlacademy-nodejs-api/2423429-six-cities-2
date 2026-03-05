import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { FavoriteService } from './favorite-service.interface.js';
import { FavoriteEntity } from './favorite.entity.js';
import { OfferEntity } from '../offer/offer.entity.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';

@injectable()
export class DefaultFavoriteService implements FavoriteService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.FavoriteModel) private readonly favoriteModel: types.ModelType<FavoriteEntity>,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async add(userId: string, offerId: string): Promise<void> {
    const existing = await this.favoriteModel.findOne({ userId, offerId }).exec();

    if (!existing) {
      await this.favoriteModel.create({ userId, offerId });
      this.logger.info(`Offer ${offerId} added to favorites for user ${userId}`);
    }
  }

  public async remove(userId: string, offerId: string): Promise<void> {
    await this.favoriteModel.findOneAndDelete({ userId, offerId }).exec();
    this.logger.info(`Offer ${offerId} removed from favorites for user ${userId}`);
  }

  public async removeByOfferId(offerId: string): Promise<void> {
    await this.favoriteModel.deleteMany({ offerId }).exec();
    this.logger.info(`All favorites removed for offer ${offerId}`);
  }

  public async isFavorite(userId: string, offerId: string): Promise<boolean> {
    const favorite = await this.favoriteModel.findOne({ userId, offerId }).exec();
    return !!favorite;
  }

  public async findByUserId(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const favorites = await this.favoriteModel.find({ userId }).exec();
    const offerIds = favorites.map((f) => f.offerId);

    return this.offerModel
      .find({ _id: { $in: offerIds } })
      .populate('host')
      .exec();
  }
}
