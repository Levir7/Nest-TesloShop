import { UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
  // * solo pasamos los decorators sin el arroba
    RoleProtected(...roles), // enviamos al metadata con el decorator RoleProtected los roles que nos han indicado desde el controller

    UseGuards(
        AuthGuard(), // valida que el token del usuario sea valido
        UserRoleGuard // vaalida que los roles enviados al metadata coincidan con los del usuario y le devolvemos un true o false dependiendo del acceso definido en el Auth
      )
  );
}