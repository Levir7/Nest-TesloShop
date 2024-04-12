import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    };
}

@Injectable()
export class MessagesWsService {
    // lugar donde voy a almacenar todos mis sockets

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async registerClient( client: Socket, userId: string){

        const user = await this.userRepository.findOneBy({id: userId}) // buscamos el usuario en el repository

        if( !user ) throw new Error(' user not found')
        if( !user.isActive ) throw new Error(' user not active')

        this.checkUserConnection(user)

        this.connectedClients[client.id] = {
            socket: client,
            user
        };

    }
    removeClient( clientId: string){
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[]{

        return Object.keys(this.connectedClients);
    }

    getUserFullName(socketId: string){
        return this.connectedClients[socketId].user.fullName;
    }

    private checkUserConnection( user: User){

        for (const clientId of Object.keys(this.connectedClients)) {
            
            const connectedClient = this.connectedClients[clientId];

            if( connectedClient.user.id === user.id){
                connectedClient.socket.disconnect();
                break;
            }

        }

    }
}
