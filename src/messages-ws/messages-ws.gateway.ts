import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

// * tenemos que implementar las interfaces de las 2 Connection paa poder ver las conexion y desconexiones
// namespace es como la habitacion donde va escuchar: ( es como definir hacia donde quiero que escuche en vivo )
@WebSocketGateway({ cors: true /* namespace: '/' */ })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(private readonly messagesWsService: MessagesWsService,
      private readonly jwtService: JwtService,
    ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload

    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);

    } catch (error) {

      client.disconnect();
      return;
    }

    // console.log(payload)


    // console.log({ conectados: this.messagesWsService.getConnectedClients() })

    // podemos indicar cuando alguien se conecte que lo mande a 'ventas'
    // client.join('ventas')
    // this.wss.to('ventas').emit('')



    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected: ', client.id)

    this.messagesWsService.removeClient(client.id);

    // console.log({ conectados: this.messagesWsService.getConnectedClients() })

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }
  // message form client
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    
    //! Emite unicamente al cliente
    // mee¿ssage from serv to client
    // client.emit('message-from-server', {
    //   fullName: 'It`s me',
    //   message: payload.message || 'no-message',
    // })
    
    //! Emitir a todos menos al cliente que emite el mesage
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'It`s me',
    //   message: payload.message || 'no-message',
    // })

    //! Emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    })



  }


}
