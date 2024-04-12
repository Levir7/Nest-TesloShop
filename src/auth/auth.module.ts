import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // providers como JwtStrategy
  imports: [
    TypeOrmModule.forFeature([User]),

    ConfigModule, // importamos el configservice para poder utilizarlo en el modulo

    PassportModule.register({ defaultStrategy: 'jwt' }),

    // * HAY QUE CONFIGURAR EL MODULO ASYNCRONO PARA QUE NO SE CREE HASTA QUE TENGAMOS LAS VARIABLES DE ENTORNO
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (configService : ConfigService) => {
        
        console.log(process.env.JWT_SECRET) // TAMBIEN PODEMOS PONER SOLO PROCESS.ENV EN EL SECRET DE JWT 
        
          return {
          secret: configService.get('JWT_SECRET'), // ESTA ES LA VARIABLE DE ENTONRNO DEFINIDA EN EL .ENV
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),

  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule], // exportamos todo lo que vamos a necesitar utilizar en otros modulos
})
export class AuthModule {}
