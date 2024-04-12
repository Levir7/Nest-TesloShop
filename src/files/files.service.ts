import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {

  getStaticProductImage(imageName: string) {

    const path = join(__dirname, '../../static/products', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException('no product found with image name');
    }

    return path;
  }
  
}
