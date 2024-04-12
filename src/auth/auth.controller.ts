import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport'; // este guard utiliza nuestra estrategia de validacion definida 

import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  @Get('check-auth-status')
  @Auth() // validamos que esté autenticado
  checkAuthStatus(
    @GetUser() user: User, // si lo está obtenemos el user desde el request
  ){
    return this.authService.checkAuthStatus( user /* id del usuario */)
  }



  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() raw: string[],
  ){

    // console.log(user)
    // console.log( request)

    return {
      ok: true,
      message: 'Hola mundo Private',
      user,
      userEmail,
      raw
    }
  }

  // una manera de autenticar y autorizar de manera más rustica 
  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user']) // podemos enviar en el metadata los roles que tendran acceso y los validaremos con el UserRoleGuard
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user) // enviamos desde las opciones del enum los args al decorator que se encarga de enviarlos en la metadata
  @UseGuards(
    AuthGuard(),
    UserRoleGuard // guards personalizados siempre usarlos sin el new ()
  )
  privateRoute2(
    @GetUser() user: User
  ){

    return { 
      ok: true,
      user,
    }
  }

  //* esta es la mejor manera de utilizar la authorization con los decorators y guards creados
  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User
  ){

    return { 
      ok: true,
      user,
    }
  }

}
