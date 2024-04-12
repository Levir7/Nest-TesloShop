import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    
    @InjectRepository( User )
    private readonly userRepository: Repository<User>
    ) {}
//---------------------
  async runSeed() {

    await this.deleteTables()

    const adminUser = await this.insertUsers()

    await this.insertNewProducts( adminUser );

    return 'SEED EXECUTED';
  }
  //-------------
  private async deleteTables() {
    
    await this.productsService.deleteAllProducts(); // primero borramos los products por el tema de la relacion entre la tabla products y user

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers( ) {

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create( user ));
    })

    const dbUsers = await this.userRepository.save(users)

    return dbUsers[0]; // regresamos solo un usuari opara insertar los products

  }

  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];
    // insertamos una promesa por cada objeto dentro de products y los guardamos en el array de promesas
    products.forEach(( product ) => {
      insertPromises.push( this.productsService.create( product, user ) );
    }) 
    // le pedimos que espere a que termine de ejecutar todas las promesas del array
    await Promise.all( insertPromises );

    return true;
  }
}
