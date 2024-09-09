import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseService } from 'src/common/service/base.service';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LIMIT_QUERY_EMAIL } from 'src/common/constants/pagination';

@Injectable()
export class UserService extends BaseService<
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(
    databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {
    super(databaseService, 'user');
  }

  async createWithHash(data: Prisma.UserCreateInput) {
    const user = await this.databaseService.user.findUnique({
      where: { email: data.email },
    });
    if (user !== null) {
      throw new ConflictException('Email has already registered');
    }
    const hashedPassword = await this.hashPassword(data.password_hash);

    const userData = {
      email: data.email,
      password_hash: hashedPassword,
      username: data.username,
    };

    const createUser = await this.create(userData);

    const payload = {
      sub: createUser.user_id,
      email: createUser.email,
    };
    const jwt = await this.jwtService.signAsync(payload);

    return {
      token: jwt,
      payload,
    };
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  async findOneOrFailByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async getEmail(text: string) {
    return await this.databaseService.user.findMany({
      where: {
        email: {
          startsWith: text,
          mode: 'insensitive',
        },
      },
      select: {
        email: true,
      },
      take: LIMIT_QUERY_EMAIL,
    });
  }
}
