export class Message {
  roomId: string;
  senderId: string;
  content: string;
  timestamp: Date;

  constructor(data: {
    roomId: string;
    senderId: string;
    content: string;
    timestamp?: Date;
  }) {
    this.roomId = data.roomId;
    this.senderId = data.senderId;
    this.content = data.content;
    this.timestamp = data.timestamp ?? new Date();
  }
}
