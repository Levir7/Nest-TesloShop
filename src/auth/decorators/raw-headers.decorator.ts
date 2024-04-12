import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    ( data: string, contex: ExecutionContext ) => {

        const req = contex.switchToHttp().getRequest();
        return req.rawHeaders;
        
    }
);