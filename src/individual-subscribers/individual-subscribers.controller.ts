import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  IndividualSort,
  IndividualSubscribersService,
} from './individual-subscribers.service';
import { CreateIndividualSubscriberDto } from './dto/create-individual-subscriber.dto';
import { UpdateIndividualSubscriberDto } from './dto/update-individual-subscriber.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Multer } from 'multer';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import {
  convertFileToBase64,
  extractColumnAndDirection,
  getPaginationParams,
} from 'src/lib';

@ApiTags('Individual Subscribers')
@UseGuards(JwtGuard)
@Controller('individual-subscribers')
export class IndividualSubscribersController {
  constructor(
    private readonly individualSubscribersService: IndividualSubscribersService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('passportPicture'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create an individual subscriber' })
  @ApiBody({
    description: 'Form data for creating an individual subscriber',
    type: CreateIndividualSubscriberDto,
  })
  @ApiResponse({
    status: 201,
    description: 'The individual subscriber has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Body() createIndividualSubscriberDto: CreateIndividualSubscriberDto,
    @UploadedFile() passportPicture: Multer.File,
    @Req() req: Request,
  ) {
    // console.log(createIndividualSubscriberDto)
    if (passportPicture && !passportPicture.mimetype.startsWith('image/')) {
      throw new BadRequestException('Uploaded file should be an image.');
    }

    const file = passportPicture ? convertFileToBase64(passportPicture) : '';

    // console.log(file, createIndividualSubscriberDto,req);
    // return true
    // console.log(req.userDetails)
    // return

    return this.individualSubscribersService.create(
      createIndividualSubscriberDto,
      file,
      req.userDetails.user,
      req.userDetails.staffDbId,
    );
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
    enum: IndividualSort,
    description: 'Order by column',
    example: IndividualSort.name_asc,
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
    @Query('sort') sort: IndividualSort,
    @Req() req: Request,
  ) {
    const paginate = getPaginationParams(req);
    const options = {
      page,
      pageSize,
      search: query ?? '',
      filter: {},
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
      const result = await this.individualSubscribersService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
      // console.log('here', error)
      return { error: error.message };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.individualSubscribersService.findOneById(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('passportPicture'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateIndividualSubscriberDto: UpdateIndividualSubscriberDto,
    @UploadedFile() passportPicture: Multer.File,
    @Req() req: Request,
  ) {
    const file = passportPicture
      ? convertFileToBase64(passportPicture)
      : '';

    return this.individualSubscribersService.update(
      +id,
      updateIndividualSubscriberDto,
      file,
      req.userDetails.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.individualSubscribersService.remove(+id);
  }
}
