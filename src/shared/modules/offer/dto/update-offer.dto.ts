import { Expose } from 'class-transformer';

export class UpdateOfferDto {
  @Expose()
  public title?: string;

  @Expose()
  public description?: string;

  @Expose()
  public city?: string;

  @Expose()
  public previewImage?: string;

  @Expose()
  public images?: string[];

  @Expose()
  public isPremium?: boolean;

  @Expose()
  public isFavorite?: boolean;

  @Expose()
  public rating?: number;

  @Expose()
  public type?: string;

  @Expose()
  public rooms?: number;

  @Expose()
  public guests?: number;

  @Expose()
  public price?: number;

  @Expose()
  public conveniences?: string[];

  @Expose()
  public location?: {
    latitude: number;
    longitude: number;
  };
}
