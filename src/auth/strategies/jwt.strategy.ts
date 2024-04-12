import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt.payload";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable() // lo indicamos como un injectable para poder importarlo como provider en el modulo
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>, // vamos a utilizar la entidad de User

        configService: ConfigService, // generamos la configuracion de las variables de entorno con este ConfigService
    ){
        // son las propiedades que estamos heredando y definimos sus opropiedades de la configuracion para el padre
        super({
            secretOrKey: configService.get('JWT_SECRET'), // tomamos la variable de entorno JWT_SECRET
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Le indicamos que extraiga el jwt de auth -> bearer token y si lo extrae continue con la ejecucion de la funcion validate
        });
    }

    async validate( payload: JwtPayload ): Promise<User>{
        
        const { id } = payload;

        const user = await this.userRepository.findOneBy({id});

        if( !user )
            throw new UnauthorizedException('Token not valid')

        if( !user.isActive )
            throw new UnauthorizedException('User not active, talk with the administrator')
        
        return user ; // esto que retorne se va guardar en la request
    }


}