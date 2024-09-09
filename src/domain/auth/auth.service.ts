import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/SignIn.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(data: SignInDto) {
    const { email, password } = data;
    const foundUser = await this.userService.findOneOrFailByEmail(email);
    const isMatch = await this.userService.comparePassword(
      password,
      foundUser.password_hash,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Password is not invalid');
    }
    const payload = {
      sub: foundUser.user_id,
      email: foundUser.email,
    };
    const jwt = await this.jwtService.signAsync(payload);

    return {
      token: jwt,
      payload,
    };
  }
}
