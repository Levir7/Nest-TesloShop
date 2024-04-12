import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

//* DEFINIMOS EL NOMBRE DE LA METADATA QUE VAMOS A BUSCAR O VALIDAR
export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[] ) => {
    
    
    return SetMetadata(META_ROLES, args) // le enviamos a la metadata el nombre del META?ROLES y los args son los roles que vamos a permitir pasar, ( son los que enviamos en el decorator desde el controller )
};
