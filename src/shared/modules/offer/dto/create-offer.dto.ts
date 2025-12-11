import { Ref } from '@typegoose/typegoose/lib/types.js';
import { City, HousingType, Convenience, Location } from '../../../helpers/index.js';
import { UserEntity } from '../../user/index.js';

export class CreateOfferDto {
  constructor(
    public title: string,
    public description: string,
    public postDate: Date,
    public city: City,
    public previewImage: string,
    public images: string[],
    public isPremium: boolean,
    public isFavorite: boolean,
    public rating: number,
    public type: HousingType,
    public rooms: number,
    public guests: number,
    public price: number,
    public conveniences: Convenience[],
    public host: Ref<UserEntity>,
    public location: Location
  ) {}
}
