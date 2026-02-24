import { Request, Response, NextFunction } from 'express';
import multer, { diskStorage } from 'multer';
import { extname } from 'node:path';
import { nanoid } from 'nanoid';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

export class UploadFileMiddleware implements Middleware {
  private upload: multer.Multer;

  constructor(
    private readonly uploadDirectory: string,
    private readonly fieldName: string,
    private readonly maxFileSize: number = 5 * 1024 * 1024, // 5MB по умолчанию
  ) {
    this.upload = multer({
      storage: diskStorage({
        destination: this.uploadDirectory,
        filename: (_req, file, cb) => {
          const fileExt = extname(file.originalname);
          const filename = `${nanoid()}${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: this.maxFileSize },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files are allowed'));
          return;
        }
        cb(null, true);
      },
    });
  }

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uploadMiddleware = this.upload.single(this.fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            next(new HttpError(
              StatusCodes.BAD_REQUEST,
              `File too large. Max size: ${this.maxFileSize / 1024 / 1024}MB`
            ));
            return;
          }
        }

        next(new HttpError(
          StatusCodes.BAD_REQUEST,
          err.message || 'File upload error'
        ));
        return;
      }

      next();
    });
  }
}
