import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector // CON EL REFLECTOR PODREMOS OBTENER LOS METADATOS
  ){}


  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    // para que el guard sea valido para el CanActivate debe retornar un boolean
    // console.log({userRoleaGuard: 'canActivate'})
    // * extraemos los metadatos enviados 
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())
    // si no nos envian ningun metadata significa que esta ruta no está protegida por lo que va poder pasar, solo con que esté autenticado
    if( !validRoles ) return true;
    if( validRoles.length === 0 ) return true;


    // extraemos el request para validar el user
    const req = context.switchToHttp().getRequest()
    const user = req.user;
    // si en el request no hay user devolvemos este error
    if ( !user )
      throw new BadRequestException('User not found')
    // si alguno de los roles del user coincide con los que extraimos de los meadata devolvemos un true y aceptamos que continúe
      for ( const role of user.roles ) {
        if( validRoles.includes( role )) {
          return true;
        }
      }

      throw new ForbiddenException(`${user.fullName} need a valid roles like: [${validRoles}]`)
  }
}
