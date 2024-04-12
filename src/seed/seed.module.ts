import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ProductsModule, // SE IMPORTA EL MODULO DE DONDE QUEREMOS UTILIZAR LOS SERVICIOS ETC..
    AuthModule // * tenemos que importarlo si queremos utilizar la authentication en este modulo
  ]
})
export class SeedModule {}
