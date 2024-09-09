import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'user name',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
  @ApiProperty({
    example: 'abc@example.com',
    description: 'Email',
    format: 'email',
    uniqueItems: true,
    minLength: 6,
    maxLength: 255,
    nullable: false,
  })
  @MaxLength(255)
  @MinLength(6)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
  @ApiProperty({
    description: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
