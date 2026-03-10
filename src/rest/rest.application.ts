import { Logger } from '../shared/libs/logger/index.js';
import { Config, RestSchema } from '../shared/libs/config/index.js';
import { inject, injectable } from 'inversify';
import { Component } from '../shared/types/index.js';
import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { getMongoURI } from '../shared/helpers/index.js';
import express, { Express } from 'express';
import cors from 'cors';
import { Controller } from '../shared/libs/rest/index.js';
import { ExceptionFilter } from '../shared/libs/rest/exception-filter/exception-filter.interface.js';

@injectable()
export class RestApplication {
  private readonly server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.UserController) private readonly userController: Controller,
    @inject(Component.OfferController) private readonly offerController: Controller,
    @inject(Component.CommentController) private readonly commentController: Controller,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter,
  ) {
    this.server = express();
  }

  private async _initDb() {
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT').toString(),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(mongoUri);
  }

  private _initMiddleware() {
    // CORS middleware
    this.server.use(cors());
    this.logger.info('CORS middleware initialized (all origins allowed)');

    // JSON middleware
    this.server.use(express.json());
    this.logger.info('JSON middleware initialized');

    // Static files middleware
    this.server.use(
      '/static',
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );
    this.logger.info('Static middleware initialized');
  }

  private _initControllers() {
    this.server.use(this.userController.router);
    this.server.use(this.offerController.router);
    this.server.use(this.commentController.router);
    this.logger.info('Controllers initialized');
  }

  private _initExceptionFilters() {
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.logger.info('Exception filters initialized');
  }

  private async _initServer() {
    const port = this.config.get('PORT');
    this.server.listen(port, () => {
      this.logger.info(`Server is listening on http://localhost:${port}`);
    });
  }

  public async init() {
    this.logger.info('=================================');
    this.logger.info('Application initialization');
    this.logger.info('=================================');

    this.logger.info('Step 1: Database connection');
    await this._initDb();
    this.logger.info('Database connected');

    this.logger.info('Step 2: Middleware initialization');
    this._initMiddleware();

    this.logger.info('Step 3: Controllers initialization');
    this._initControllers();

    this.logger.info('Step 4: Exception filters initialization');
    this._initExceptionFilters();

    this.logger.info('Step 5: Server startup');
    await this._initServer();

    this.logger.info('=================================');
    this.logger.info('Application successfully started');
    this.logger.info(`Server: http://localhost:${this.config.get('PORT')}`);
    this.logger.info('=================================');
  }
}
