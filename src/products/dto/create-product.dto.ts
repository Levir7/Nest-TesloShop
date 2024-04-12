import { ApiProperty } from "@nestjs/swagger";
import { 
    IsArray, 
    IsIn, 
    IsInt, 
    IsNumber, 
    IsOptional, 
    IsPositive, 
    IsString, 
    MinLength } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        description: 'Product Title (unique)',
        nullable: false,
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex']) // validamos que sea un valor que tenga dentro lo que hay en el array (alguno)
    gender: string;

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[]

    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[]
}
