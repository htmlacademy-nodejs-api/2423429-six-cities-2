import { Logger } from '../../libs/logger/index.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { inject, injectable } from 'inversify';
import { Component } from '../../types/index.js';
import { DatabaseClient } from '../../libs/database-client/index.js';
import { getMongoURI } from '../../helpers/index.js';
import express, { Express } from 'express';
import { Controller } from './index.js';
import { ExceptionFilter } from './exception-filter/exception-filter.interface.js';


@injectable()
export class RestApplication {
  private readonly server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.UserController) private readonly userController: Controller,
    @inject(Component.OfferController) private readonly offerController: Controller,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter
  ) {
    this.server = express();
  }

  private async _initDb() {
    const mongoUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(mongoUri);
  }

  private _initMiddleware() {
    this.server.use(express.json());
    this.logger.info('Middleware initialized');
  }

  private _initControllers() {
    this.server.use(this.userController.router);
    this.server.use(this.offerController.router);
    this.logger.info('Controllers initialized');
  }

  private _initExceptionFilters() {
    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
    this.logger.info('Exception filters initialized');
  }

  private async _initServer() {
    const port = this.config.get('PORT');
    this.server.listen(port);
  }

  public async init() {
    this.logger.info('Application initialization');

    this.logger.info('Init database...');
    await this._initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init middleware...');
    this._initMiddleware();

    this.logger.info('Init controllers...');
    this._initControllers();

    this.logger.info('Init exception filters...');
    this._initExceptionFilters();

    this.logger.info('Try to init server...');
    await this._initServer();
    this.logger.info(`Server started on http://localhost:${this.config.get('PORT')}`);
  }
}
