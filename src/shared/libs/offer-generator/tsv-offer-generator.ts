import { OfferGenerator } from './offer-generator.interface.js';
import dayjs from 'dayjs';
import { generateRandomValue, getRandomItem, getRandomItems, getRandomBoolean, Location } from '../../helpers/index.js';
import { MockServerData } from '../../types/mock-server-data.type.js';

const MIN_PRICE = 100;
const MAX_PRICE = 100000;
const MIN_RATING = 1;
const MAX_RATING = 5;
const MIN_ROOMS = 1;
const MAX_ROOMS = 8;
const MIN_GUESTS = 1;
const MAX_GUESTS = 10;
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
    const goods = getRandomItems<string>(this.mockData.goods).join(';');

    const hostName = getRandomItem<string>(this.mockData.users);
    const hostEmail = getRandomItem<string>(this.mockData.emails);
    const hostAvatar = getRandomItem<string>(this.mockData.avatars);
    const hostPassword = `pass${Math.random().toString(36).slice(-8)}`;
    const hostType = getRandomBoolean() ? 'Pro' : 'Regular';
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
    const rooms = generateRandomValue(MIN_ROOMS, MAX_ROOMS);
    const guests = generateRandomValue(MIN_GUESTS, MAX_GUESTS);
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE);
    const commentsCount = generateRandomValue(0, 100);

    return [
      title,
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
    ].join('\t');
  }
}
