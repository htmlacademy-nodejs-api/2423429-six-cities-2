import { Command } from './command.interface.js';
import { MockServerData } from '../../shared/types/index.js';
import { TSVOfferGenerator } from '../../shared/libs/offer-generator/tsv-offer-generator.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';
import { getErrorMessage } from '../../shared/helpers/index.js';
import got from 'got';

export class GenerateCommand implements Command {
  private initialData: MockServerData;

  private async load(url: string) {
    try {
      console.log(`Loading data from ${url}...`);
      this.initialData = await got.get(url).json();
      console.log(`Loaded ${this.initialData.titles?.length} titles`);
    } catch (error) {
      console.error(`Load error: ${error}`);
      throw new Error(`Can't load data from ${url}`);
    }
  }

  private async write(filepath: string, offerCount: number) {
    console.log(`Writing ${offerCount} offers to ${filepath}...`);

    const tsvOfferGenerator = new TSVOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    for (let i = 0; i < offerCount; i++) {
      const generated = tsvOfferGenerator.generate();
      console.log(`Generated offer ${i + 1}: ${generated.substring(0, 50)}...`);
      await tsvFileWriter.write(generated);
    }

    console.log(`Finished writing to ${filepath}`);
  }

  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);

    console.log(`Execute generate: count=${count}, filepath=${filepath}, url=${url}`);

    try {
      await this.load(url);
      await this.write(filepath, offerCount);
      console.info(`✅ File ${filepath} was created!`);
    } catch (error: unknown) {
      console.error('❌ Can\'t generate data');
      console.error(getErrorMessage(error));
    }
  }
}
