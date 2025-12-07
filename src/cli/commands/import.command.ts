// src/cli/commands/import.command.ts
import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/tsv-file-reader.js';
import { createOffer, getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { ConsoleLogger } from '../../shared/libs/logger/console.logger.js';
import { DefaultUserService, UserModel } from '../../shared/modules/user/index.js';
import { DefaultOfferService, OfferModel } from '../../shared/modules/offer/index.js';
import { MongoDatabaseClient } from '../../shared/libs/database-client/mongo.database-client.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './commands.constant.js';
import chalk from 'chalk';
import { Offer } from '../../shared/helpers/index.js';

export class ImportCommand implements Command {
  private userService: DefaultUserService;
  private offerService: DefaultOfferService;
  private databaseClient: MongoDatabaseClient;
  private logger: ConsoleLogger;
  private salt: string;

  constructor() {
    // Bind context for event handlers
    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);

    // Create services manually (without DI container)
    this.logger = new ConsoleLogger();
    this.offerService = new DefaultOfferService(this.logger, OfferModel);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
  }

  private async onImportedLine(line: string, resolve: () => void): Promise<void> {
    try {
      const offer = createOffer(line);
      await this.saveOffer(offer);
      console.info(chalk.green(`✓ Offer imported: ${offer.title}`));
    } catch (error) {
      console.error(chalk.red(`✗ Error processing line: ${getErrorMessage(error)}`));
      console.error(chalk.gray(`  Line content: ${line.substring(0, 100)}...`));
    } finally {
      resolve();
    }
  }

  private onCompleteImport(count: number): void {
    console.info(chalk.blue(`\n✅ Import completed. Total rows: ${count}`));
    this.databaseClient.disconnect();
  }

  private async saveOffer(offerData: Offer): Promise<void> {
    // 1. Find or create user (offerData has host field)
    const user = await this.userService.findOrCreate({
      name: offerData.host.name,
      email: offerData.host.email,
      password: DEFAULT_USER_PASSWORD, // Use default password for security
      type: offerData.host.type,
      avatar: offerData.host.avatar || 'default-avatar.jpg'
    }, this.salt);

    // 2. Create offer
    const offerDto = {
      title: offerData.title,
      description: offerData.description,
      postDate: offerData.postDate || new Date(),
      city: offerData.city,
      previewImage: offerData.previewImage,
      images: offerData.images || [],
      isPremium: offerData.isPremium || false,
      isFavorite: false, // Default not favorite
      rating: offerData.rating || 0,
      type: offerData.type,
      rooms: offerData.rooms || 1,
      guests: offerData.guests || 1,
      price: offerData.price || 100,
      conveniences: offerData.conveniences || [],
      host: user.id, // Use the created/found user ID
      commentsCount: offerData.commentsCount || 0,
      location: offerData.location
    };

    await this.offerService.create(offerDto);
  }

  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    // Check parameter count
    if (parameters.length < 6) {
      console.error(chalk.red('❌ Not enough parameters!'));
      console.error(chalk.yellow('Usage:'));
      console.error(chalk.yellow('  npm run cli -- --import <filename> <login> <password> <host> <dbname> <salt>'));
      console.error(chalk.yellow('\nExample:'));
      console.error(chalk.yellow('  npm run cli -- --import ./mocks/offers.tsv admin password localhost six-cities my-salt'));
      return;
    }

    const [filename, login, password, host, dbname, salt] = parameters;

    try {
      console.log(chalk.blue('\n📤 Starting import...'));
      console.log(chalk.gray(`  File: ${filename}`));
      console.log(chalk.gray(`  Database: ${host}/${dbname}`));

      // Get MongoDB connection URI
      const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);

      // Set salt for password hashing
      this.salt = salt;

      // Connect to database
      console.log(chalk.blue('  Connecting to database...'));
      await this.databaseClient.connect(uri);
      console.log(chalk.green('  ✅ Connected to database'));

      // Create file reader
      const fileReader = new TSVFileReader(filename.trim());

      // Handle events (pattern from demo: line + resolve)
      fileReader.on('line', this.onImportedLine);
      fileReader.on('end', this.onCompleteImport);

      // Start reading file
      console.log(chalk.blue('  Reading file...'));
      await fileReader.read();

    } catch (error) {
      console.error(chalk.red('\n❌ Import failed!'));
      console.error(chalk.red(`  Error: ${getErrorMessage(error)}`));

      // Disconnect from database on error
      try {
        await this.databaseClient.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }
}
