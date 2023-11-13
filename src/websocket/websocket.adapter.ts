import { IoAdapter } from '@nestjs/platform-socket.io';

export class WebsocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.meta = 'abc';
    return server;
  }

  //   bindClientConnect(server: any, callback: Function): void {
  //     console.log('!!!!!!!!');
  //     console.log(server.meta);
  //   }
}
