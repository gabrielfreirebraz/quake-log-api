import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export const httpErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error ${err.status || 500} - ${err.message}`, {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      url: req.url,
      status: err.status,
      message: err.message
    });
  
    res.status(err.status || 500).json({
      error: {
        status: err.status,
        message: err.message
      }
    });
  }