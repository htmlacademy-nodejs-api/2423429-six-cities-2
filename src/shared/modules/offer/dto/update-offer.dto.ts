import { City, HousingType, Convenience, Location } from '../../../helpers';

export class UpdateOfferDto {
  constructor(
    public title?: string,
    public description?: string,
    public city?: City,
    public previewImage?: string,
    public images?: string[],
    public isPremium?: boolean,
    public isFavorite?: boolean,
    public rating?: number,
    public type?: HousingType,
    public rooms?: number,
    public guests?: number,
    public price?: number,
    public conveniences?: Convenience[],
    public location?: Location
  ) {}
}
