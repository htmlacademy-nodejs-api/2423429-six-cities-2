import { OfferGenerator } from './offer-generator.interface.js';
import dayjs from 'dayjs';
import { generateRandomValue, getRandomItem, getRandomItems, getRandomBoolean } from '../../helpers/index.js';
import { MockServerData } from '../../types/mock-server-data.type.js';
import { Location } from '../../types/offer.type.js';

const MIN_PRICE = 100;
const MAX_PRICE = 100000;
const MIN_RATING = 1;
const MAX_RATING = 5;
<<<<<<< HEAD
const MIN_BEDROOMS = 1;
const MAX_BEDROOMS = 8;
const MIN_ADULTS = 1;
const MAX_ADULTS = 10;
=======
const MIN_ROOMS = 1;
const MAX_ROOMS = 8;
const MIN_GUESTS = 1;
const MAX_GUESTS = 10;
>>>>>>> feature-fixes
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
<<<<<<< HEAD
    const conveniences = getRandomItems<string>(this.mockData.goods).join(';');

    // Получаем случайные данные пользователя из отдельных массивов
    const hostName = getRandomItem<string>(this.mockData.users);
    const hostEmail = getRandomItem<string>(this.mockData.emails);
    const hostAvatar = getRandomItem<string>(this.mockData.avatars);

    // Генерируем случайный пароль
    const hostPassword = `pass${Math.random().toString(36).slice(-8)}`;

    // Выбираем случайный тип пользователя
    const hostType = getRandomBoolean() ? 'Pro' : 'Regular';

    const location = getRandomItem<Location>(this.mockData.Locations);
=======
    const goods = getRandomItems<string>(this.mockData.goods).join(';');

    const hostName = getRandomItem<string>(this.mockData.users);
    const hostEmail = getRandomItem<string>(this.mockData.emails);
    const hostAvatar = getRandomItem<string>(this.mockData.avatars);
    const hostPassword = `pass${Math.random().toString(36).slice(-8)}`;
    const hostType = getRandomBoolean() ? 'Pro' : 'Regular';
    const location = getRandomItem<Location>(this.mockData.locations);
>>>>>>> feature-fixes

    const images = Array.from({ length: 6 }, () =>
      getRandomItem<string>(this.mockData.offerImages)
    ).join(';');

    const createdDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();

    const isPremium = getRandomBoolean();
    const isFavorite = getRandomBoolean();
    const rating = generateRandomValue(MIN_RATING, MAX_RATING, 1);
<<<<<<< HEAD
    const bedrooms = generateRandomValue(MIN_BEDROOMS, MAX_BEDROOMS);
    const maxAdults = generateRandomValue(MIN_ADULTS, MAX_ADULTS);
=======
    const rooms = generateRandomValue(MIN_ROOMS, MAX_ROOMS);
    const guests = generateRandomValue(MIN_GUESTS, MAX_GUESTS);
>>>>>>> feature-fixes
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE);
    const commentsCount = generateRandomValue(0, 100);

    return [
      title,
<<<<<<< HEAD
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
      hostName.trim(), // hostName (14)
      hostEmail.trim(), // hostEmail (15)
      hostAvatar.trim(), // hostAvatar (16)
      hostPassword.trim(), // hostPassword (17)
      hostType, // hostType (18)
      commentsCount.toString(), // commentsCount (19)
      location.latitude.toString(), // latitude (20)
      location.longitude.toString() // longitude (21)
=======
      description,
      createdDate,
      cityName,
      previewImage,
      images,
      isPremium.toString(),
      isFavorite.toString(),
      rating.toString(),
      housingType,
      rooms.toString(),
      guests.toString(),
      price.toString(),
      goods,
      hostName.trim(),
      hostEmail.trim(),
      hostAvatar.trim(),
      hostPassword.trim(),
      hostType,
      commentsCount.toString(),
      location.latitude.toString(),
      location.longitude.toString()
>>>>>>> feature-fixes
    ].join('\t');
  }
}
