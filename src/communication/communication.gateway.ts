import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PreOffer } from './models/PreOffer';
import { PreOfferAnswer } from './models/PreOfferAnswer';

@WebSocketGateway()
export class CommunicationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('CommunicationGateway');
  private connectionIds: Array<string> = [];

  handleConnection(client: Socket): void {
    this.connectionIds.push(client?.id);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.connectionIds = this.connectionIds.filter(
      (connectionId) => connectionId !== client.id,
    );
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('pre-offer')
  handlePreOffer(
    @MessageBody() preOfferData: PreOffer,
    @ConnectedSocket() client: Socket,
  ): void {
    const { calleeId, callType } = preOfferData;
    const connectionId = this.connectionIds.find(
      (connectionId) => connectionId === calleeId,
    );

    if (!connectionId) {
      this.server.to(client?.id).emit('pre-offer', 'NOT_FOUND');
      this.logger.log(`Callee not found aborting...`);
      return;
    }

    this.server.to(connectionId).emit('pre-offer', {
      callerId: client?.id,
      callType,
    });
  }

  @SubscribeMessage('pre-offer-answer')
  handlePreOfferAnswer(
    @MessageBody() preOfferAnswerData: PreOfferAnswer,
    @ConnectedSocket() client: Socket,
  ): void {
    const { callerId, callType, answer } = preOfferAnswerData;
    const connectionId = this.connectionIds.find(
      (connectionId) => connectionId === callerId,
    );

    if (!connectionId) {
      this.server.to(client?.id).emit('pre-offer-answer', 'NOT_FOUND');
      this.logger.log(`Caller not found aborting...`);
      return;
    }

    this.server.to(connectionId).emit('pre-offer-answer', {
      callerId: client?.id,
      callType,
      answer,
    });
  }
}
