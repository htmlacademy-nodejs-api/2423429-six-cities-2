
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
    const cityName = getRandomItem<string>(this.mockData.cities);
    const previewImage = getRandomItem<string>(this.mockData.offerImages);
    const housingType = getRandomItem<string>(this.mockData.types);
    const conveniences = getRandomItems<string>(this.mockData.goods).join(';');

    // Получаем случайного пользователя как массив данных [name, email, avatar, password, type]
    const userArray = getRandomItem(this.mockData.users).split(';');
    const [hostName, hostEmail, hostAvatar, hostPassword, hostType] = userArray;

    const location = getRandomItem<Location>(this.mockData.locations);

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
    const commentsCount = generateRandomValue(0, 100);

    return [
      `${title} in ${cityName}`, // name (0)
      description, // description (1)
      createdDate, // publishDate (2)
      cityName, // city (3)
      previewImage, // previewImage (4)
      images, // images (5)
      isPremium.toString(), // isPremium (6)
      isFavorite.toString(), // isFavorite (7)
      rating.toString(), // rating (8)
      housingType, // type (9)
      bedrooms.toString(), // rooms (10)
      maxAdults.toString(), // guests (11)
      price.toString(), // price (12)
      conveniences, // conveniences (13)
      hostName?.trim() || 'Default', // hostName (14)
      hostEmail?.trim() || 'email@example.com', // hostEmail (15)
      hostAvatar?.trim() || 'default-avatar.jpg', // hostAvatar (16)
      hostPassword?.trim() || 'defaultpass', // hostPassword (17)
      hostType?.trim() || 'Regular', // hostType (18)
      commentsCount.toString(), // commentsCount (19)
      location.latitude.toString(), // latitude (20)
      location.longitude.toString() // longitude (21)
    ].join('\t');
  }
}
