import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords } from 'src/lib';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneWithUsername(username);

    if (user && user.passwordResetRequired) {
      const { password, ...result } = user;
      return result;
    } else if (
      user &&
      !user.passwordResetRequired &&
      comparePasswords(password, user.password)
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      firstName: user.staff.firstName,
      lastName: user.staff.lastName,
      otherNames: user.staff.otherNames,
      id: user.id,
      staffDbId: user.staff.id,
      staffCode: user.staff.staffCode,
      roleId: user.role.id,
      sub: {
        name: `${user.staff.firstName} ${user.staff.otherNames ?? ''} ${
          user.staff.lastName
        }`,
      },
    };
    return {
      ...user,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
  }

  async refreshToken(user: User) {
    const payload = {
      username: user.username,
      firstName: user.staff.firstName,
      lastName: user.staff.lastName,
      otherNames: user.staff.otherNames,
      id: user.id,
      staffDbId: user.staff.id,
      staffCode: user.staff.staffCode,
      roleId: user.role.id,
      sub: {
        name: `${user.staff.firstName} ${user.staff.otherNames ?? ''} ${
          user.staff.lastName
        }`,
      },
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
