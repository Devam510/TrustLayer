import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  IsIn,
  IsDecimal,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(1)
  budget!: number

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional({ example: 'US', default: 'US' })
  @IsOptional()
  @IsString()
  countryCode?: string

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  bufferPct?: string

  @ApiPropertyOptional({ type: Array })
  @IsOptional()
  @IsArray()
  milestones?: object[]
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
