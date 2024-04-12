import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({ name: 'product_images' })
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    // relation con la tablas Product M : 1
    @ManyToOne(
        () => Product,
        ( product ) => product.images,
        { onDelete: 'CASCADE'} // con esto le decimos que si se borra el product, tambien se borren en cascada las imagenes
    )
    product: Product;
}