import { inject, injectable } from 'inversify';
import { CommentService } from './comment-service.interface.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { Component } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { Types } from 'mongoose';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.OfferService) private readonly offerService: OfferService
  ) {}

  public async create(dto: CreateCommentDto, userId: string): Promise<DocumentType<CommentEntity>> {
    // 1. Проверяем существование оффера
    const offerExists = await this.offerService.exists(dto.offerId);
    if (!offerExists) {
      throw new Error(`Offer with id ${dto.offerId} not found`);
    }

    // 2. Создаём комментарий
    const result = await this.commentModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      offerId: new Types.ObjectId(dto.offerId)
    });

    this.logger.info(`New comment created for offer ${dto.offerId} by user ${userId}`);

    // 3. АТОМАРНО УВЕЛИЧИВАЕМ СЧЁТЧИК КОММЕНТАРИЕВ
    await this.offerService.incrementCommentCount(dto.offerId);

    // 4. ПЕРЕСЧИТЫВАЕМ И ОБНОВЛЯЕМ РЕЙТИНГ
    const averageRating = await this.getAverageRating(dto.offerId);
    await this.offerService.updateRating(dto.offerId, averageRating);

    // 5. Возвращаем комментарий с информацией об авторе
    return result.populate('userId');
  }

  public async findByOfferId(offerId: string, limit = 50): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({ offerId: new Types.ObjectId(offerId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId')
      .exec();
  }

  public async deleteByOfferId(offerId: string): Promise<void> {
    // 1. Удаляем все комментарии оффера
    const result = await this.commentModel
      .deleteMany({ offerId: new Types.ObjectId(offerId) })
      .exec();

    this.logger.info(`Deleted ${result.deletedCount} comments for offer ${offerId}`);

    // 2. СБРАСЫВАЕМ СТАТИСТИКУ ОФФЕРА
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

    // Округляем до 1 знака после запятой
    const averageRating = Math.round(result[0].avgRating * 10) / 10;
    return averageRating;
  }

  // Метод для массового удаления (при удалении оффера)
  public async deleteCommentsByOfferId(offerId: string): Promise<number> {
    const result = await this.commentModel
      .deleteMany({ offerId: new Types.ObjectId(offerId) })
      .exec();

    this.logger.info(`Deleted ${result.deletedCount} comments for offer ${offerId}`);
    return result.deletedCount || 0;
  }
}
