import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { ProductImage, Product } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); // creamos el logger y le decimos que es de ProductsService

  constructor(
    // ? injectamos la entidad con la que trabajaremos la tabla de la base de datos
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    // injectamos la otra entidad
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {

    const {images = [], ...productDetails} = createProductDto;

    try {
      // creamos el product con base a la entidad
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({url: image}) ),
        user
      });

      // guardamos el product
      await this.productRepository.save(product);

      return {...product, images};
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        // Indicamos que llene la relación o los campos que esten relacionados dentro de la entidad
        relations: {
          images: true,
        }
      });

      return products.map(product => ({
        ...product,
        images: product.images.map(image => image.url)
      }))

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const querBuilder = this.productRepository.createQueryBuilder('prod');

      product = await querBuilder
        .where(`UPPER(title) = :title or slug = :slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with id: ${term} not found`);

    return product;
  }

  //* metodo para regresar el finOne pero plano, es decir solo las url de la relacion con la entidad ProductImage
  async findOnePlain(term: string){
    const { images = [], ...rest} = await this.findOne( term);

    return {
      ...rest,
      images: images.map( img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    
    // ? Destructuramos los datos recibidos
    const {images, ...toUpdate} = updateProductDto
    // * precargamos el product desde la bd
    const product = await this.productRepository.preload({ id, ...toUpdate, });
    

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

      //Create queryRunner para poder crear querys y manipular la bd para actualizar products y productimages
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // conectamos a la bd
    await queryRunner.startTransaction(); // inicializamos la transaction para nuestro objeto

    try {
      // si recibimos imagenes borramos las imagenes anteriores
      if( images ) {
        // desde el query runner podemos eliminar los registros, y le decimos la entidad o tabla donde va a afectar, y en el segundo le decimos el criterio (como un where) {product: {id} }
        await queryRunner.manager.delete( ProductImage, { product: { id } } ) // le decimos que borre los productImages donde la columna product  coincida con el id del producto
        // guardamos en la propiedad images en el nuevo array de imagenes
        product.images = images.map( 
            image => this.productImageRepository.create({ url: image })
          )
        }

        product.user = user // agregamos el usuario al product

        // guardamos  los cambios al product

        await queryRunner.manager.save( product )
        
        // en caso de que funcione hace el commit
        await queryRunner.commitTransaction();

        await queryRunner.release() // cerramos la conexion a la bd

      return this.findOnePlain(id); // retornamos nuestra funcion de findOnePlain para que nos muestre el objeto con las relaciones
    } catch (error) {
      // en caso de error cancelamos las transactions para no afectar mis registros con los errores
      await queryRunner.rollbackTransaction();
      await queryRunner.release();


      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove( product );
  }

  // creamos una función para manejar los errores
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  // ! Clear all products of the Product DB
  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query
      .delete()
      .where({})
      .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}