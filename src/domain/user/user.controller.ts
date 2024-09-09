import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { SerializeInterceptor } from 'src/interceptor/serialize.interceptor';

@Controller('')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiOperation({
    summary: 'Register a new user',
  })
  @Public()
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiCreatedResponse({ description: 'User created' })
  @Post('/register')
  register(@Body() data: CreateUserDto) {
    return this.userService.createWithHash({
      username: data.username,
      email: data.email,
      password_hash: data.password,
    });
  }
  @ApiOperation({
    summary: 'Get email',
  })
  @Get('/email')
  async getEmail(@Query('email') email: string) {
    return (await this.userService.getEmail(email)).map((item)=>item.email);
  }
}
