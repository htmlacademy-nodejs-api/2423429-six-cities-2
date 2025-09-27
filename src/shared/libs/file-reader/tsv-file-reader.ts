/* eslint-disable camelcase */
import { readFileSync } from 'node:fs';
import { FileReader } from './file-reader.interface.js';


export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(private readonly filename: string) {}

  public read(): void {
    this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
  }


}
