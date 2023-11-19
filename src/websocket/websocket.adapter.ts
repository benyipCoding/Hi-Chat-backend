import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/auth/interfaces';
export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server: Server = super.createIOServer(port, options);
    server.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) next(new Error('jwt tokens must be provide'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        console.log('ws adapter', decoded);
      } catch (error) {
        return next(new Error(error));
      }
      next();
    });
    return server;
  }
}
