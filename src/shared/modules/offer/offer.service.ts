import { OfferService } from './offer-service.interface.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { Component } from '../../types/index.js';
import { inject, injectable } from 'inversify';
import { Logger } from '../../libs/logger/index.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create({
      ...dto,
      postDate: dto.postDate || new Date(),
      isPremium: dto.isPremium ?? false,
      isFavorite: dto.isFavorite ?? false,
      rating: dto.rating ?? 0,
      commentsCount: 0
    });

    this.logger.info(`New offer created: ${result.title}`);
    return result;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findById(offerId)
      .populate('host')
      .exec();
  }

  public async findAll(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .populate('host')
      .sort({ postDate: -1 })
      .exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate('host')
      .exec();

    if (result) {
      this.logger.info(`Offer updated: ${result.title}`);
    }

    return result;
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .findByIdAndDelete(offerId)
      .exec();

    if (result) {
      this.logger.info(`Offer deleted: ${result.title}`);
    }

    return result;
  }

  public async findPremiumByCity(city: string, limit: number = 3): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .populate('host')
      .sort({ postDate: -1 })
      .limit(limit)
      .exec();
  }

  public async findFavorites(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ isFavorite: true })
      .populate('host')
      .sort({ postDate: -1 })
      .exec();
  }

  public async toggleFavorite(offerId: string, isFavorite: boolean): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(
        offerId,
        { isFavorite },
        { new: true }
      )
      .exec();
  }

  public async exists(offerId: string): Promise<boolean> {
    const offer = await this.offerModel.exists({ _id: offerId }).exec();
    return !!offer;
  }

  public async incrementCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(
        offerId,
        { $inc: { commentsCount: 1 } },
        { new: true }
      )
      .exec();
  }

  public async decrementCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(
        offerId,
        { $inc: { commentsCount: -1 } },
        { new: true }
      )
      .exec();
  }

  public async findByHostId(hostId: string): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ host: hostId })
      .populate('host')
      .sort({ postDate: -1 })
      .exec();
  }

  public async countByHostId(hostId: string): Promise<number> {
    return this.offerModel
      .countDocuments({ host: hostId })
      .exec();
  }

  public async updateRating(offerId: string, newRating: number): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(
        offerId,
        { rating: newRating },
        { new: true }
      )
      .exec();
  }

  public async updateOfferStats(
    offerId: string,
    stats: { rating?: number; commentCount?: number } // делаем поля опциональными
  ): Promise<void> {
  // Используем тип Partial для обновления только нужных полей
    const updateData: Partial<Pick<OfferEntity, 'rating' | 'commentsCount'>> = {};

    // Обновляем рейтинг, если передан
    if (stats.rating !== undefined) {
      updateData.rating = stats.rating;
    }

    // Обновляем счётчик комментариев, если передан
    if (stats.commentCount !== undefined) {
      updateData.commentsCount = stats.commentCount;
    }

    // Если обновлять нечего, выходим
    if (Object.keys(updateData).length === 0) {
      this.logger.debug(`No stats to update for offer ${offerId}`);
      return;
    }

    await this.offerModel
      .findByIdAndUpdate(offerId, { $set: updateData })
      .exec();

    this.logger.info(`Offer ${offerId} stats updated: ${JSON.stringify(updateData)}`);
  }
}
