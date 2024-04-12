import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common"
// creamos u decorator para validar los datos del usuario en las rutas que queramos proteger
// * Lo decorators no son más que funciones y esperan un callbavkc como argumento
export const GetUser = createParamDecorator(
    ( data: string, contex: ExecutionContext) => {
        // * el contex es el contexto en el que se está ejecutando nest y ademas tenemos acceso a la request
        // la data veine siendo como un argumento que se puede agregar dentro del decorator en el controller
        // console.log({contex})

        const req = contex.switchToHttp().getRequest();
        const user = req.user;

        if ( !user )
            throw new InternalServerErrorException(' User no found (request) ')

        return ( !data ) ? user : user[data];
    }
)