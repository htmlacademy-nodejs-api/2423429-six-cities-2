import { Expose } from 'class-transformer';

export class CreateOfferDto {
  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public postDate!: Date;

  @Expose()
  public city!: string; // Используем string вместо City

  @Expose()
  public previewImage!: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public type!: string; // Используем string вместо HousingType

  @Expose()
  public rooms!: number;

  @Expose()
  public guests!: number;

  @Expose()
  public price!: number;

  @Expose()
  public conveniences!: string[]; // Используем string[] вместо Convenience[]

  @Expose()
  public host!: string; // Используем string вместо Ref<UserEntity>

  @Expose()
  public location!: {
    latitude: number;
    longitude: number;
  };

  // Убираем конструктор или делаем его опциональным
}
