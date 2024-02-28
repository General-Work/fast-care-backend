import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { UserSort, UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
// import { OrderDirection } from 'src/pagination/pagination.service';
import { extractColumnAndDirection, getPaginationParams } from 'src/lib';
import { Request } from 'express';

@ApiTags('Users')
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.userDetails.user);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Page size',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search column',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter active',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: UserSort,
    description: 'Order by column',
    example: UserSort.username_asc,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') query: string,
    @Query('active') active: string,
    @Query('sort') sort: UserSort,
    @Req() req: Request,
  ) {
    const paginate = getPaginationParams(req);
    const filter =
      active && active === 'true'
        ? true
        : active === 'false'
          ? false
          : undefined;

    const filters = [];

    if (filter !== undefined) {
      filters.push({ confirmed: filter });
    }
    const filteredFilters = filters.filter(
      (filter) => Object.values(filter)[0],
    );

    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: filteredFilters.length
        ? Object.assign({}, ...filteredFilters)
        : {},
      order: [],
      routeName: paginate.routeName,
      path: paginate.path,
      query: paginate.query,
    };

    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
      const result = await this.usersService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findUser(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    return this.usersService.update(+id, updateUserDto, req.userDetails.user);
  }

  @Put('change-password')
  @ApiResponse({
    status: 201,
    description: 'Successfully changed password.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  changePassword(@Body() data: ChangePasswordDto, @Req() req: Request) {
    return this.usersService.changePassword(
      data,
      req.userDetails.userId,
      req.userDetails.user,
    );
  }

  @Patch('reset-password/:id')
  resetPassword(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.resetPassword(+id, req.userDetails.user);
  }

  @Patch('disable-user/:id')
  disableUser(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.disableUser(+id, req.userDetails.user);
  }
  @Patch('enable-user/:id')
  enableUser(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.enableUser(+id, req.userDetails.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
