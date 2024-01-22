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
} from '@nestjs/common';
import { IndividualSubscribersService } from './individual-subscribers.service';
import { CreateIndividualSubscriberDto } from './dto/create-individual-subscriber.dto';
import { UpdateIndividualSubscriberDto } from './dto/update-individual-subscriber.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Multer } from 'multer';
import { Response, Request } from 'express';
import { JwtGuard } from 'src/auth/gurads/jwt-auth.guard';

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

    // const x = Buffer.from(pic, 'base64');
    // // console.log(x)
    // return {
    //   receivedData: createIndividualSubscriberDto,
    //   imageData: pic,
    // };
  }

  @Get()
  findAll() {
    return this.individualSubscribersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.individualSubscribersService.findOneById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndividualSubscriberDto: UpdateIndividualSubscriberDto,
  ) {
    return this.individualSubscribersService.update(
      +id,
      updateIndividualSubscriberDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.individualSubscribersService.remove(+id);
  }
}
