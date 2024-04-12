import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { Express, Response } from 'express';
import { Multer, diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

import { fileFilter , fileNamer} from './helpers';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // con este decorador le indicamos que nosotros vamos a tomasr el control del return
    @Param('imageName') imageName: string // obtenemos el  id de la imagen
  ){

    const path = this.filesService.getStaticProductImage(imageName)

    res.sendFile( path )
  }


  @Post('product')
  // useinterceptor le especificamos el FileInterceptor y dentro le especificamos el nombre que le pusimos al body al cargar el archivo
  @UseInterceptors(FileInterceptor('img', { 
    fileFilter: fileFilter, // funcion para validar el archivo
    // limits: {fileSize: 1000}
    storage: diskStorage({ // guardar archivos en un directorio
      destination: './static/products',
      filename: fileNamer
    }), 
  })) // interceptor de solicituds o respuestas
  uploadProductImage(
      @UploadedFile() // necesitamos primero extraer con el decorador el archivo que van a subir
      file : Express.Multer.File, // archivo que se subió
    ){

      if( !file ){
        throw new BadRequestException('Make sure that the file is a image')
      }

      const secureUrl = `${ this.configService.get('HOST_API')}/files/product/${ file.filename}`


    return { 
      secureUrl
    } ;
  }


}
