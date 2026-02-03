import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Controller } from './controller.interface.js';
import { Route } from '../types/route.interface.js';

export abstract class BaseController implements Controller {
  private readonly _router: Router;

  constructor() {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  public addRoute(route: Route): void {
    this._router[route.method](route.path, route.handler);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res.type('application/json').status(statusCode).json(data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send<T>(res, StatusCodes.OK, data);
  }

  public created<T>(res: Response, data: T): void {
    this.send<T>(res, StatusCodes.CREATED, data);
  }

  public noContent<T>(res: Response, data: T): void {
    this.send<T>(res, StatusCodes.NO_CONTENT, data);
  }
}
