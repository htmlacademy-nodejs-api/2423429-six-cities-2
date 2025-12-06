import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

@injectable()
export class OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);
    return result;
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate('host').exec();
  }

  public async findAll(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel.find().populate('host').exec();
  }

  public async deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel.findByIdAndDelete(offerId).exec();

    if (result) {
      this.logger.info(`Offer deleted: ${offerId}`);
    }

    return result;
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate('host')
      .exec();

    if (result) {
      this.logger.info(`Offer updated: ${offerId}`);
    }

    return result;
  }

  public async findPremiumByCity(city: string, limit: number = 3): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .sort({ postDate: -1 })
      .limit(limit)
      .populate('host')
      .exec();
  }

  public async findFavorites(): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ isFavorite: true })
      .populate('host')
      .exec();
  }

  public async toggleFavorite(offerId: string, isFavorite: boolean): Promise<DocumentType<OfferEntity> | null> {
    const result = await this.offerModel
      .findByIdAndUpdate(offerId, { isFavorite }, { new: true })
      .populate('host')
      .exec();

    if (result) {
      this.logger.info(`Offer ${offerId} favorite status changed to: ${isFavorite}`);
    }

    return result;
  }

  public async exists(offerId: string): Promise<boolean> {
    const offer = await this.offerModel.exists({ _id: offerId }).exec();
    return !!offer;
  }

  public async incrementCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, { $inc: { commentsCount: 1 } }, { new: true })
      .exec();
  }

  public async decrementCommentCount(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(offerId, { $inc: { commentsCount: -1 } }, { new: true })
      .exec();
  }
}
