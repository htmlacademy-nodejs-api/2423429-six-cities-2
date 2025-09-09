import { TSVFileReader } from '../../shared/libs/file-reader/tsv-file-reader.js';
import { Command } from './command.interface.js';
import chalk from 'chalk';

export class ImportCommand implements Command {
  public getName(): string {
    return '--import';
  }

  public execute(...parameters: string[]): void {
    const [filename] = parameters;
    const fileReader = new TSVFileReader(filename.trim());

    try {
      console.log(chalk.blue('📤 Starting import...'));
      fileReader.read();

      const data = fileReader.toArray();
      console.log(chalk.green(`✅ Import successful! Items: ${data.length}`));

      console.log(chalk.cyan('📊 Imported data:'));
      console.log(data);

    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      console.error(chalk.red(`❌ Can't import data from file: ${filename}`));
      console.error(chalk.yellow(`🔍 Details: ${err.message}`));
    }
  }
}
