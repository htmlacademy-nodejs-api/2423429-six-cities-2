import { injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Response, Router, RequestHandler } from 'express';
import { Controller } from './controller.interface.js';
import { Logger } from '../../logger/index.js';
import { Route } from '../types/route.interface.js';
import { Middleware } from '../middleware/middleware.interface.js';

const DEFAULT_CONTENT_TYPE = 'application/json';

@injectable()
export abstract class BaseController implements Controller {
  private readonly _router: Router;

  constructor(
    protected readonly logger: Logger
  ) {
    this._router = Router();
  }

  get router() {
    return this._router;
  }

  public addRoute(route: Route): void {
    // Собираем middleware-функции
    const middlewares: RequestHandler[] = (route.middlewares || [])
      .map((middleware: Middleware) => middleware.execute.bind(middleware));

    // Добавляем хендлер после всех middleware
    const handlers = [...middlewares, route.handler.bind(this)];

    // Регистрируем маршрут с массивом обработчиков
    this._router[route.method](route.path, handlers);

    // Логируем информацию о маршруте
    const middlewareInfo = route.middlewares?.length
      ? ` with ${route.middlewares.length} middleware(s)`
      : '';
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}${middlewareInfo}`);
  }

  public send<T>(res: Response, statusCode: number, data: T): void {
    res
      .type(DEFAULT_CONTENT_TYPE)
      .status(statusCode)
      .json(data);
  }

  public created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  public noContent<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.NO_CONTENT, data);
  }

  public ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }
}
