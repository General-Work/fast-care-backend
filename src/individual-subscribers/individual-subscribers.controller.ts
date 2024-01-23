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
  Res,
  BadRequestException,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IndividualSubscribersService } from './individual-subscribers.service';
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
import { Response, Request } from 'express';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';
import { OrderDirection } from 'src/pagination/pagination.service';

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
    if (!passportPicture || !passportPicture.mimetype.startsWith('image/')) {
      throw new BadRequestException('Uploaded file should be an image.');
    }

    const pic = passportPicture
      ? passportPicture.buffer.toString('base64')
      : undefined;

    return this.individualSubscribersService.create(
      createIndividualSubscriberDto,
      pic,
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
    name: 'staffCode',
    required: false,
    type: String,
    description: 'Search staff Code',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    type: String,
    description: 'Search last Name',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    type: String,
    description: 'Search first Name',
  })
  @ApiQuery({
    name: 'orderByLastName',
    required: false,
    enum: OrderDirection,
    example: OrderDirection.ASC,
    description: 'Order by last name',
  })
  @ApiQuery({
    name: 'orderByFirstName',
    required: false,
    enum: OrderDirection,
    example: OrderDirection.ASC,
    description: 'Order by first name',
  })
  @ApiQuery({
    name: 'orderByMembershipID',
    required: false,
    enum: OrderDirection,
    example: OrderDirection.ASC,
    description: 'Order by membership ID code',
  })
  @ApiQuery({
    name: 'orderByDateCreated',
    required: false,
    enum: OrderDirection,
    example: OrderDirection.ASC,
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
    @Query('membershipID') query: string,
    @Query('lastName') lastName: string,
    @Query('firstName') firstName: string,
    @Query('orderByLastName') sortLastName: OrderDirection,
    @Query('orderByFirstName') sortFirstName: OrderDirection,
    @Query('orderByMembershipID') sortMembershipID: OrderDirection,
    @Query('orderByFacility') sortFacility: OrderDirection,

    @Query('orderByDateCreated') createdAt: OrderDirection,
    @Req() req,
  ) {
    const routeName = `${req.protocol}://${req.get('host')}${req.path}`;

    const options = {
      page,
      pageSize,
      filter: { membershipID: query, lastName, firstName },
      order: [
        { column: 'lastName', direction: sortLastName },
        { column: 'firstName', direction: sortFirstName },
        { column: 'membershipID', direction: sortMembershipID },
        { column: 'createdAt', direction: createdAt },
        { column: 'facility', direction: sortFacility },
      ],
      routeName,
    };

    try {
      const result = await this.individualSubscribersService.findAll(options);
      return result;
    } catch (error) {
      // Handle errors or return appropriate HTTP responses
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
    const pic = passportPicture
      ? passportPicture.buffer.toString('base64')
      : undefined;

    return this.individualSubscribersService.update(
      +id,
      updateIndividualSubscriberDto,
      pic,
      req.userDetails.user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.individualSubscribersService.remove(+id);
  }
}
