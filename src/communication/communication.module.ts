import { Module } from '@nestjs/common';
import { CommunicationGateway } from './communication.gateway';

@Module({
  providers: [CommunicationGateway]
})
export class CommunicationModule {}
