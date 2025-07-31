import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger =new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected successfully');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data:createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const {page,limit}=paginationDto;
    const totalPages=await this.product.count({where: { available: true }});
    const lastPage=Math.ceil(totalPages/limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true 
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    const product= await this.product.findFirst({
      where: { id , available: true},//puedo dejarlo asi por que son iguales los nombres
    });

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const{id:_,...data}=updateProductDto;
    
    await this.findOne(id); // Verifies if the product exists before updating

    return this.product.update({
      where: { id },
      data: data,//lo hice para ignorar el id que viene en el dto, antes era updateProductDto
    })
  }

  async remove(id: number) {
    
    await this.findOne(id); // Verifies if the product exists before deleting

    // return this.product.delete({
    //   where: { id },
    // });

    const product = await this.product.update({
      where: { id },
      data: {
         available: false 
      }
    });

    return product;
  }
}
