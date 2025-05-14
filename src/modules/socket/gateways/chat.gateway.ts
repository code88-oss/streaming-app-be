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
    payload: { roomId: string; message: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('payload', payload);
    const savedMessage = await this.chatService.saveMessage(
      payload.roomId, // 'xQc'
      payload.message, // 'Cc'
      payload.senderId, // 'superadmin'
    );

    this.server.to(payload.roomId).emit('newMessage', savedMessage);
  }
}
