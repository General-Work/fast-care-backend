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
    const { facility, staff, ...others } = user;
    const payload = {
      username: others.username,
      firstName: user.staff.firstName,
      lastName: user.staff.lastName,
      otherNames: user.staff.otherNames,
      id: user.id,
      staffDbId: user.staff.id,
      staffCode: user.staff.staffCode,
      roleId: user.role.id,
      // role: user.role, 

      sub: {
        name: `${user.staff.firstName} ${user.staff.otherNames ?? ''} ${
          user.staff.lastName
        }`,
      },
    };
    return {
      ...others,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
  }

  async refreshToken(user: User) {
    // console.log(user);
    const data = await this.userService.findOneWithUsername(user.username);
    // const { facility, staff, ...others } = data;
    const payload = {
      username: data.username,
      firstName: data.staff.firstName,
      lastName: data.staff.lastName,
      otherNames: data.staff.otherNames,
      id: data.id,
      staffDbId: data.staff.id,
      staffCode: data.staff.staffCode,
      roleId: data.role.id,
      sub: {
        name: `${data.staff.firstName} ${data.staff.otherNames ?? ''} ${
          data.staff.lastName
        }`,
      },
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
