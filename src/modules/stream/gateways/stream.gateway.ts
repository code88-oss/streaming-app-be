import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'streams',
  cors: {
    origin: '*',
  },
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Join user-specific room based on userId (sent during handshake)
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      console.log(`Client ${client.id} joined room: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Emit stream status update to the user's room
  notifyStreamStatus(
    userId: string,
    streamId: string,
    status: 'live' | 'offline',
    message?: string,
  ) {
    this.server.to(userId).emit('streamStatus', {
      streamId,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
