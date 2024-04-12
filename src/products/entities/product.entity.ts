import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' }) // lo volvemnos una entity esta clase quiere decir que será un a tabla
export class Product {

  @ApiProperty({ 
    example: '15a9b783-b0bd-4df7-a916-9b942fb7cca7',
    description: 'Product id uuid',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ 
    example: 'T-shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;


  @ApiProperty({ 
    example: 0,
    description: 'Product price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({ 
    example: 'lorem ipsum dolor sit amet, consectetur adip',
    description: 'Product description',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({ 
    example: 'T_shirt_Teslo',
    description: 'Product SLUG - for CEO',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({ 
    example: 10,
    description: 'Product stock',
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({ 
    example: ['CH', 'M', 'XL'],
    description: 'Product sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({ 
    example: 'Men',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column({
    type: 'text',
    array: true,
    default: []
  })
  tags: string[];

  // relacion con la tabla ProductImage  1 : M
  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @ManyToOne(
    () => User,
    ( user ) => user.product,
    { eager: true }
  )
    user: User;

  // * Antes de hacer una inserción podemos organizar o modificar los datos recibidos, en este caso para el slug vanmos a modificarlo y si no viene decirle que tome el nombre del title y lo manipule de modo que el slug ahora si exista antes de la inserción a la bd
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
