import { createWriteStream, WriteStream } from 'node:fs';
import { FileWrite } from './file-writer.interface.js';

export class TSVFileWriter implements FileWrite {
  private stream: WriteStream;

  constructor(filename: string) {
<<<<<<< HEAD

=======
    console.log(`Creating file: ${filename}`); // ✅ Добавьте для отладки
>>>>>>> feature-fixes
    this.stream = createWriteStream(filename, {
      flags: 'w',
      encoding: 'utf-8',
      autoClose: true,
    });
<<<<<<< HEAD
  }

  public async write(row: string): Promise<unknown> {
    const writeSuccess = this.stream.write(`${row}\n`);
    if(! writeSuccess) {
=======

    // ✅ Добавьте обработчик ошибок
    this.stream.on('error', (error) => {
      console.error(`File write error: ${error.message}`);
    });
  }

  public async write(row: string): Promise<unknown> {
    console.log(`Writing row: ${row.substring(0, 50)}...`); // ✅ Добавьте для отладки

    const writeSuccess = this.stream.write(`${row}\n`);
    if (!writeSuccess) {
>>>>>>> feature-fixes
      return new Promise((resolve) => {
        this.stream.once('drain', () => resolve(true));
      });
    }

    return Promise.resolve();
  }
}
