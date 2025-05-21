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
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    // Xử lý khi client kết nối
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Xử lý khi client ngắt kết nối
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('joinedRoom', roomId);
    client.join(roomId);
    client.emit('joinedRoom', roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: { roomId: string; content: string; senderId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, content, senderId } = payload;

      if (!roomId || !content || !senderId) {
        throw new Error('Invalid payload');
      }

      const savedMessage = await this.chatService.saveMessage({
        senderId,
        roomId,
        content,
      });

      this.server.to(roomId).emit('newMessage', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', { message: 'Failed to save message' });
    }
  }
}
