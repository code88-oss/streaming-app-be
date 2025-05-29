import {
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

  private viewersMap = new Map<string, Set<string>>(); // streamId => Set<socketId>

  handleConnection(client: Socket) {
    const streamId = client.handshake.query.streamId as string;
    if (streamId) {
      client.join(streamId);

      const viewers = this.viewersMap.get(streamId) || new Set();
      viewers.add(client.id);
      this.viewersMap.set(streamId, viewers);

      this.broadcastViewerCount(streamId);
    }
  }

  handleDisconnect(client: Socket) {
    this.viewersMap.forEach((viewers, streamId) => {
      if (viewers.delete(client.id)) {
        this.broadcastViewerCount(streamId);
      }
    });
  }

  private broadcastViewerCount(streamId: string) {
    const viewers = this.viewersMap.get(streamId);
    this.server.to(streamId).emit('viewerCount', viewers?.size || 0);
  }
}
