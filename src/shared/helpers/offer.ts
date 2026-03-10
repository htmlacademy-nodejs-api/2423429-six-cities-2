import { City, HousingType, Convenience, Offer } from '../types/offer.type.js';
import { UserType, User } from '../types/user.type.js';

export function createOffer(offerData: string): Offer {
  const fields = offerData.split('\t');

  // Проверяем, что достаточно полей
  if (fields.length < 22) {
    throw new Error(`Invalid offer data: expected 22 fields, got ${fields.length}`);
  }

  const [
    title,
    description,
    publishDate,
    city,
    previewImage,
    images,
    isPremium,
    isFavorite,
    rating,
    type,
    rooms,
    guests,
    price,
    goods,
    hostName,
    hostEmail,
    hostAvatar,
    hostPassword,
    hostType,
    commentsCount,
    latitude,
    longitude,
  ] = fields;

  const cityMapping: Record<string, City> = {
    'Paris': City.Paris,
    'Cologne': City.Cologne,
    'Brussels': City.Brussels,
    'Amsterdam': City.Amsterdam,
    'Hamburg': City.Hamburg,
    'Dusseldorf': City.Dusseldorf
  };

  const housingTypeMapping: Record<string, HousingType> = {
    'apartment': HousingType.Apartment,
    'house': HousingType.House,
    'room': HousingType.Room,
    'hotel': HousingType.Hotel
  };

  const userTypeMapping: Record<string, UserType> = {
    'Regular': UserType.Regular,
    'pro': UserType.Pro
  };

  const parseGoods = (goodsStr: string): Convenience[] => {
    const goodsMapping: Record<string, Convenience> = {
      'Breakfast': Convenience.Breakfast,
      'Air conditioning': Convenience.AirConditioning,
      'Laptop friendly workspace': Convenience.LaptopFriendlyWorkspace,
      'Baby seat': Convenience.BabySeat,
      'Washer': Convenience.Washer,
      'Towels': Convenience.Towels,
      'Fridge': Convenience.Fridge
    };

    return goodsStr.split(';')
      .map((item) => item.trim())
      .filter((item) => item in goodsMapping)
      .map((item) => goodsMapping[item]);
  };

  const parseImages = (imagesStr: string): string[] =>
    imagesStr.split(';').map((img) => img.trim());

  const user: User = {
    name: hostName.trim(),
    email: hostEmail.trim(),
    avatar: hostAvatar?.trim() || 'default-avatar.jpg',
    password: hostPassword.trim(),
    type: userTypeMapping[hostType] || UserType.Regular
  };

  return {
    title: title.trim(),
    description: description.trim(),
    postDate: new Date(publishDate),
    city: cityMapping[city] || City.Paris,
    previewImage: previewImage.trim(),
    images: parseImages(images),
    isPremium: isPremium.toLowerCase() === 'true',
    isFavorite: isFavorite.toLowerCase() === 'true',
    rating: parseFloat(rating),
    type: housingTypeMapping[type] || HousingType.Apartment,
    rooms: parseInt(rooms, 10),
    guests: parseInt(guests, 10),
    price: parseInt(price, 10),
    goods: parseGoods(goods),
    host: user,
    commentsCount: parseInt(commentsCount, 10),
    location: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }
  };
}
