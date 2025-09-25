export type Location = {
  latitude: number;
  longitude: number;
};

export type MockServerData = {
  cities: string[];
  titles: string[];
  descriptions: string[];
  offerImages: string[];
  types: string[];
  goods: string[];
  users: string[];
  emails: string[];
  avatars: string[];
  locations: Location[];
};

export type Offer = {
  name: string;
  description: string;
  date: Date;
  city: string;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: string;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: string[];
  host: string;
  location: Location;
};
