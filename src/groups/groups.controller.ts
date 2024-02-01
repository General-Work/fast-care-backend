import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GroupSort, GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { Request } from 'express';
import { extractColumnAndDirection } from 'src/lib';

@ApiTags('Groups')
@UseGuards(JwtGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Group has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createGroupDto: CreateGroupDto, @Req() req: Request) {
    return this.groupsService.create(createGroupDto, req.userDetails.user);
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
    name: 'sort',
    required: false,
    enum: GroupSort,
    description: 'Order by column',
    example: GroupSort.name_asc,
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
    @Query('sort') sort: GroupSort,
    @Req() req,
  ) {
    const routeName = `${req.protocol}://${req.get('host')}${req.path}`;

    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: {},
      order: [],
      routeName,
    };

    try {
      if (sort) {
        const { column, direction } = extractColumnAndDirection(sort);
        options.order.push({ column, direction });
      }
      const result = await this.groupsService.findAll(options);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    // updatedBy: string,
    @Req() req,
  ) {
    return this.groupsService.update(+id, updateGroupDto, req.userDetails.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
