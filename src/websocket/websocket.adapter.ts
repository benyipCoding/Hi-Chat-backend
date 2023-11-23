import { IoAdapter } from '@nestjs/platform-socket.io';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/auth/interfaces';
import { AuthSocket } from './interface';
export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use((socket: AuthSocket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) next(new Error('jwt tokens must be provide'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        socket.user = decoded;
      } catch (error) {
        return next(new Error(error));
      }
      next();
    });
    return server;
  }
}
