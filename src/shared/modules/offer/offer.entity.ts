import { defaultClasses, modelOptions, prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { Offer, City, HousingType, Convenience, Location } from '../../helpers';
import { UserEntity } from '../user';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers',
    timestamps: true
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OfferEntity extends defaultClasses.TimeStamps implements Omit<Offer, 'host'> {
  @prop({ required: true, minlength: 10, maxlength: 100 })
  public title!: string;

  @prop({ required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true, default: Date.now })
  public postDate!: Date;

  @prop({ required: true, enum: City })
  public city!: City;

  @prop({ required: true })
  public previewImage!: string;

  @prop({
    required: true,
    type: [String],
    validate: {
      validator: (images: string[]) => images.length === 6,
      message: 'Must have exactly 6 images'
    }
  })
  public images!: string[];

  @prop({ required: true, default: false })
  public isPremium!: boolean;

  @prop({ required: true, default: false })
  public isFavorite!: boolean;

  @prop({ required: true, min: 1, max: 5, default: 0 })
  public rating!: number;

  @prop({ required: true, enum: HousingType })
  public type!: HousingType;

  @prop({ required: true, min: 1, max: 8 })
  public rooms!: number;

  @prop({ required: true, min: 1, max: 10 })
  public guests!: number;

  @prop({ required: true, min: 100, max: 100000 })
  public price!: number;

  @prop({ required: true, type: [String], enum: Convenience })
  public conveniences!: Convenience[];

  @prop({ ref: UserEntity, required: true })
  public host!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount!: number;

  @prop({ required: true })
  public location!: Location;
}

export const OfferModel = getModelForClass(OfferEntity);
export type OfferDocument = InstanceType<typeof OfferModel>;
