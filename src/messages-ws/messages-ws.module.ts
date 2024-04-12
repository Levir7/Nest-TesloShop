import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  // messagesGateway es como un controller
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [ AuthModule ]
})
export class MessagesWsModule {}
