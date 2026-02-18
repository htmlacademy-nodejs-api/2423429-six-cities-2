// src/shared/modules/comment/comment-service.interface.ts
import { DocumentType } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

export interface CommentService {
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;
  findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]>;
  deleteByOfferId(offerId: string): Promise<void>;
  countByOfferId(offerId: string): Promise<number>;
  getAverageRating(offerId: string): Promise<number>;
  checkOfferExists(offerId: string): Promise<boolean>;
}
