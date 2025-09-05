import { citiesName } from './cities-name.enum.js';
import { ConveniencesType } from './conveniences.enum.js';
import { HouseType } from './house.type.enum.js';
import { User } from './user.type.js';

export type Offer = {
    name: string;
    description: string;
    publish_date: Date;
    city: citiesName
    preview_image: string;
    images: string[];
    is_premium: boolean;
    is_favorite: boolean;
    rating: number;
    type: HouseType;
    rooms: number;
    guests: number;
    price: number;
    conveniences: ConveniencesType[];
    host: User;
    comments_count: number;
    latitude: number
    longitude: number;
}
