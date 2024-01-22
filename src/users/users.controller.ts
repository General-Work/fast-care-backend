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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { OrderDirection } from 'src/pagination/pagination.service';

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
    name: 'name',
    required: false,
    type: String,
    description: 'Search name',
  })
  @ApiQuery({
    name: 'orderByName',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by name',
  })
  @ApiQuery({
    name: 'orderByDateCreated',
    required: false,
    type: 'ASC' || 'DESC',
    description: 'Order by dateCreated',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') query: string,
    @Query('orderByName') name: OrderDirection,
    @Query('orderByDateCreated') createdAt: OrderDirection,

    @Req() req,
  ) {
    const routeName = `${req.protocol}://${req.get('host')}${req.path}`;

    // console.log(req.userDetails)

    const options = {
      page,
      pageSize,
      filter: { name: query },
      order: [
        { column: 'name', direction: name },
        { column: 'createdAt', direction: createdAt },
      ],
      routeName,
    };

    try {
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

  @Patch('change-password')
  @ApiResponse({
    status: 201,
    description: 'Successfully changed password.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  changePassword(@Body() data: ChangePasswordDto, @Req() req) {
    return this.usersService.changePassword(data, req.userDetails.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
