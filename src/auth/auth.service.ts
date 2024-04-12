import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt'; // desde el provider jwtmodule
import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {

    try {

      const {password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password , 10 ) // hasheamos la contraseña 
      });
      
      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };;
      //  Retornar JWT de acceso


    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  
  async login( loginUserDto: LoginUserDto){

    const { password, email} = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true} // le decimos que queremos que retorne
    })

    // si no existe un usuario
    if(!user)
      throw new UnauthorizedException('Credentials are not valid (email)')

      // validamos la password
    if( !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (Password)')

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
    //  Retornar JWT de acceso
    
  }

  async checkAuthStatus( user: User ){
    
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
    
  }

  private getJwtToken(payload: JwtPayload){

    // generar token
    const token = this.jwtService.sign( payload );

    return token;

  }

  // creamos una función para manejar los errores
  private handleDBExceptions(error: any): never {

    this.logger.error(error);

    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error)

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

}
