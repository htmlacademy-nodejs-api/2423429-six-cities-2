
import { OfferGenerator } from './offer-generator.interface.js';
import dayjs from 'dayjs';
import { generateRandomValue, getRandomItem, getRandomItems, getRandomBoolean } from '../../helpers/index.js';
import { MockServerData } from '../../types/mock-server-data.type.js';
import { Location } from '../../types/offer.type.js';

const MIN_PRICE = 100;
const MAX_PRICE = 100000;
const MIN_RATING = 1;
const MAX_RATING = 5;
const MIN_BEDROOMS = 1;
const MAX_BEDROOMS = 8;
const MIN_ADULTS = 1;
const MAX_ADULTS = 10;
const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 30;

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerData) {}

  public generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const city = getRandomItem<string>(this.mockData.cities);
    const previewImage = getRandomItem<string>(this.mockData.offerImages);
    const type = getRandomItem<string>(this.mockData.types);
    const goods = getRandomItems<string>(this.mockData.goods).join(';');
    const user = getRandomItem(this.mockData.users);
    const location = getRandomItem<Location>(this.mockData.locations);

    // Генерируем 6 уникальных изображений
    const images = Array.from({ length: 6 }, () =>
      getRandomItem<string>(this.mockData.offerImages)
    ).join(';');

    const createdDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();

    const isPremium = getRandomBoolean();
    const isFavorite = getRandomBoolean();
    const rating = generateRandomValue(MIN_RATING, MAX_RATING, 1);
    const bedrooms = generateRandomValue(MIN_BEDROOMS, MAX_BEDROOMS);
    const maxAdults = generateRandomValue(MIN_ADULTS, MAX_ADULTS);
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE);

    return [
      `${title} in ${city}`, // name
      description, // description
      createdDate, // date
      city, // city
      previewImage, // previewImage
      images, // images (6 штук через ;)
      isPremium, // isPremium
      isFavorite, // isFavorite
      rating, // rating
      type, // type
      bedrooms, // bedrooms
      maxAdults, // maxAdults
      price, // price
      goods, // goods (удобства через ;)
      user, // host
      `${location.latitude},${location.longitude}` // location
    ].join('\t');
  }
}
