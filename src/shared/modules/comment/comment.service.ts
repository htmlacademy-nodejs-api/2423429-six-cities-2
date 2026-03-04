import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { Types } from 'mongoose';
import { CommentService } from './comment-service.interface.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.OfferService) private readonly offerService: OfferService
  ) {}

  public async checkOfferExists(offerId: string): Promise<boolean> {
    return this.offerService.exists(offerId);
  }

  public async create(dto: CreateCommentDto & { userId: string; offerId: string }): Promise<DocumentType<CommentEntity>> {
    // Check if offer exists
    const offerExists = await this.offerService.exists(dto.offerId);
    if (!offerExists) {
      throw new Error(`Offer with id ${dto.offerId} not found`);
    }

    // Create comment
    const result = await this.commentModel.create({
      text: dto.text,
      rating: dto.rating,
      userId: new Types.ObjectId(dto.userId),
      offerId: new Types.ObjectId(dto.offerId)
    });

    this.logger.info(`New comment created for offer ${dto.offerId} by user ${dto.userId}`);

    // Increment comment count
    await this.offerService.incrementCommentCount(dto.offerId);

    // Recalculate and update rating
    const averageRating = await this.getAverageRating(dto.offerId);
    await this.offerService.updateRating(dto.offerId, averageRating);

    // Return comment with author info
    return result.populate('userId');
  }

  public async findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({ offerId: new Types.ObjectId(offerId) })
      .sort({ createdAt: -1 })
      .populate('userId')
      .exec();
  }

  public async deleteByOfferId(offerId: string): Promise<void> {
    const result = await this.commentModel
      .deleteMany({ offerId: new Types.ObjectId(offerId) })
      .exec();

    this.logger.info(`Deleted ${result.deletedCount} comments for offer ${offerId}`);

    if (result.deletedCount > 0) {
      await this.offerService.updateOfferStats(offerId, {
        rating: 0,
        commentCount: 0
      });
    }
  }

  public async countByOfferId(offerId: string): Promise<number> {
    return this.commentModel
      .countDocuments({ offerId: new Types.ObjectId(offerId) })
      .exec();
  }

  public async getAverageRating(offerId: string): Promise<number> {
    const result = await this.commentModel.aggregate([
      { $match: { offerId: new Types.ObjectId(offerId) } },
      { $group: {
        _id: '$offerId',
        avgRating: { $avg: '$rating' }
      }}
    ]).exec();

    if (!result.length) {
      return 0;
    }

    return Math.round(result[0].avgRating * 10) / 10;
  }
}
