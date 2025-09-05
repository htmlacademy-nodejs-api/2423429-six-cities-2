import { readFileSync } from 'node:fs';
import { FileReader } from './file-reader.interface.js';
import { Offer } from '../../types/offer.type.js';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, {encoding: 'utf-8'});
  }

  public toArray(): Offer[] {
    if (!this.rawData) {
      throw new Error('File was not read');
    }

    return this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .map((line) => line.split('\t'))
      .map(([]))
  }
}

// name
// description
// publish_date
// city
// preview_image
// images
// is_premium
// is_favorite
// rating
// type
// rooms
// guests
// price
// conveniences
// host
// comments_count
// latitude
// longitude
