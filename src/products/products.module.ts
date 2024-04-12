import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product, ProductImage } from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]), // antes de trabajar con las entities hay que importarlas al modulo para que las reconozca y podemos sincronizarla con la bd 
    AuthModule
  ],
  exports:[
    ProductsService,
    TypeOrmModule // en caso de querer exportar o utilizar los repositorios en otros modulos hay que exportar el TypeOrmModule
  ]
})
export class ProductsModule {}
