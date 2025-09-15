/* eslint-disable camelcase */
import { readFileSync } from 'node:fs';
import { FileReader } from './file-reader.interface.js';
import { City, Convenience, HousingType, Offer } from '../../types/offer.type.js';
import { User, UserType } from '../../types/user.type.js';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(private readonly filename: string) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
  }

  public toArray(): Offer[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => line.split('\t'))
      .map(
        ([
          name,
          description,
          publish_date,
          city,
          preview_image,
          images,
          is_premium,
          is_favorite,
          rating,
          type,
          rooms,
          guests,
          price,
          conveniences,
          host_name,
          host_email,
          host_avatar,
          host_password,
          host_type,
          comments_count,
          latitude,
          longitude,
        ]) => {
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
            'обычный': UserType.Regular,
            'pro': UserType.Pro
          };

          const parseConveniences = (conveniencesStr: string): Convenience[] => {
            const convenienceMapping: Record<string, Convenience> = {
              'Breakfast': Convenience.Breakfast,
              'Air conditioning': Convenience.AirConditioning,
              'Laptop friendly workspace': Convenience.LaptopFriendlyWorkspace,
              'Baby seat': Convenience.BabySeat,
              'Washer': Convenience.Washer,
              'Towels': Convenience.Towels,
              'Fridge': Convenience.Fridge
            };

            return conveniencesStr.split(';')
              .map((conv) => conv.trim())
              .filter((conv) => conv in convenienceMapping)
              .map((conv) => convenienceMapping[conv]);
          };

          const parseImages = (imagesStr: string): string[] => imagesStr.split(';').map((img) => img.trim());

          const user: User = {
            name: host_name.trim(),
            email: host_email.trim(),
            avatar: host_avatar?.trim() || 'default-avatar.jpg',
            password: host_password.trim(),
            type: userTypeMapping[host_type] || UserType.Regular
          };

          return {
            name: name.trim(),
            description: description.trim(),
            postDate: new Date(publish_date),
            city: cityMapping[city] || City.Paris,
            previewImage: preview_image.trim(),
            images: parseImages(images),
            isPremium: is_premium.toLowerCase() === 'true',
            isFavorite: is_favorite.toLowerCase() === 'true',
            rating: parseFloat(rating),
            type: housingTypeMapping[type] || HousingType.Apartment,
            rooms: parseInt(rooms, 10),
            guests: parseInt(guests, 10),
            price: parseInt(price, 10),
            conveniences: parseConveniences(conveniences),
            host: user,
            commentsCount: parseInt(comments_count, 10),
            location: {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude)
            }
          };
        });
  }
}
