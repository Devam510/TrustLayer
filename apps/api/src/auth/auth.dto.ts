import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'Alice Johnson' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password!: string

  @ApiPropertyOptional({ enum: ['freelancer', 'client'], default: 'freelancer' })
  @IsOptional()
  @IsIn(['freelancer', 'client'])
  productRole?: 'freelancer' | 'client'
}

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password!: string
}
