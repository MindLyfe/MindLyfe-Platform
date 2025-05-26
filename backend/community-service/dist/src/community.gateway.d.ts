import { Server } from 'socket.io';
export declare class CommunityGateway {
    server: Server;
    emitEvent(event: string, data: any): void;
}
