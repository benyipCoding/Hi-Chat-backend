import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const logger = new Logger('Incomming');
    const method = req.method;
    const url = req.baseUrl;
    const body = JSON.stringify(req.body);
    const params = JSON.stringify(req.params);
    const client = req.ip.startsWith('::ffff:')
      ? req.ip.replace('::ffff:', '')
      : req.ip;
    logger.debug(
      `FROM ${client} [${method}] ${url} Body:${body} Params:${params}`,
    );
    next();
  }
}
