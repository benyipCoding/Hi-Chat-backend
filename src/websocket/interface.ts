import { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';

export type AuthSocket = Socket & {
  user?: JwtPayload;
};
