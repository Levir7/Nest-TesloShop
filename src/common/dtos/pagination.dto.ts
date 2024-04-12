import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many items do you need'
    })
    @IsOptional()
    @IsPositive()
    @Type( () => Number) // enableImplicitConversion: true
    limit?: number;

    @ApiProperty({
        default: 10,
        description: 'How many rows do you want to skip'
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number) // enableImplicitConversion: true
    offset?: number;
}