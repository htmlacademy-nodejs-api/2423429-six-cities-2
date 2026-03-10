<<<<<<< HEAD

=======
>>>>>>> feature-fixes
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
<<<<<<< HEAD
      this.initialData = await got.get(url).json();
    } catch {
      throw new Error(`Can't loa data from ${url}`);
=======
      console.log(`Loading data from ${url}...`); // ✅ Отладка
      this.initialData = await got.get(url).json();
      console.log(`Loaded ${this.initialData.titles?.length} titles`); // ✅ Отладка
    } catch (error) {
      console.error(`Load error: ${error}`); // ✅ Отладка
      throw new Error(`Can't load data from ${url}`);
>>>>>>> feature-fixes
    }
  }

  private async write(filepath: string, offerCount: number) {
<<<<<<< HEAD
    const tsvOfferGenerator = new TSVOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);
    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(tsvOfferGenerator.generate());
    }
=======
    console.log(`Writing ${offerCount} offers to ${filepath}...`); // ✅ Отладка

    const tsvOfferGenerator = new TSVOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    for (let i = 0; i < offerCount; i++) {
      const generated = tsvOfferGenerator.generate();
      console.log(`Generated offer ${i + 1}: ${generated.substring(0, 50)}...`); // ✅ Отладка
      await tsvFileWriter.write(generated);
    }

    console.log(`Finished writing to ${filepath}`); // ✅ Отладка
>>>>>>> feature-fixes
  }

  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);

<<<<<<< HEAD
    try {
      await this.load(url);
      await this.write(filepath, offerCount);
      console.info(`File ${filepath} was created!`);
    } catch (error: unknown) {
      console.error('Can\'t generate data');

=======
    console.log(`Execute generate: count=${count}, filepath=${filepath}, url=${url}`); // ✅ Отладка

    try {
      await this.load(url);
      await this.write(filepath, offerCount);
      console.info(`✅ File ${filepath} was created!`);
    } catch (error: unknown) {
      console.error('❌ Can\'t generate data');
>>>>>>> feature-fixes
      console.error(getErrorMessage(error));
    }
  }
}
