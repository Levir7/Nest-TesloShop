import { IsArray, IsBoolean, IsString } from "class-validator";
import { Product } from "../../products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users', synchronize: true})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text', {
        select: false // con esto indicamos que cuando se haga un find o select, no lo muestre en la consulta
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true,
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];
// * relacion entre tabla de User y la tabla de Products
    @OneToMany(
        () => Product, 
        ( product ) => product.user
    )
    product: Product;

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert();
    }
}
