import { DocumentType } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';

export interface CommentService {
  checkOfferExists(offerId: string): Promise<boolean>;
  create(dto: { text: string; rating: number; userId: string; offerId: string }): Promise<DocumentType<CommentEntity>>;
  findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]>;
  deleteByOfferId(offerId: string): Promise<void>;
  countByOfferId(offerId: string): Promise<number>;
  getAverageRating(offerId: string): Promise<number>;
}
