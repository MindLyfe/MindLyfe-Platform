import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/community', cors: true })
export class CommunityGateway {
  @WebSocketServer()
  server: Server;

  emitEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
} 