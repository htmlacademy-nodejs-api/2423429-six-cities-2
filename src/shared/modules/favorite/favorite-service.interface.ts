import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from '../offer/offer.entity.js';

export interface FavoriteService {
  add(userId: string, offerId: string): Promise<void>;
  remove(userId: string, offerId: string): Promise<void>;
  removeByOfferId(offerId: string): Promise<void>;
  isFavorite(userId: string, offerId: string): Promise<boolean>;
  findByUserId(userId: string): Promise<DocumentType<OfferEntity>[]>;
}

