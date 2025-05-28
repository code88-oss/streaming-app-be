import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(`Client connected: ${client.id}, userId: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(`Client disconnected: ${client.id}, userId: ${userId}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId;
    const { roomId } = data;

    if (!roomId || !userId) {
      client.emit('error', { message: 'Missing roomId or userId' });
      return;
    }

    client.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    client.emit('joinedRoom', { roomId });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: { roomId: string; content: string; senderId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, content, senderId } = payload;

    if (!roomId || !content || !senderId) {
      client.emit('error', { message: 'Invalid payload' });
      return;
    }

    try {
      const savedMessage = await this.chatService.saveMessage({
        senderId,
        roomId,
        content,
      });

      // ✅ Trích xuất dữ liệu sạch gửi về client
      const cleanMessage = {
        id: savedMessage.id,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        sender: {
          id: savedMessage.sender.id,
          username: savedMessage.sender.username,
        },
      };

      this.server.to(roomId).emit('newMessage', cleanMessage);
      client.emit('messageSent', cleanMessage);
    } catch (error) {
      console.error('❌ Error saving message:', error);
      client.emit('error', { message: 'Failed to save message' });
    }
  }
}
