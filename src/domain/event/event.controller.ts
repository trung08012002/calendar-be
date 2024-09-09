import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateEventDto } from './dto/CreateEvent.dto';
import { EventService } from './event.service';
import { UserReq } from 'src/common/decorator/user.decorator';
import { User } from '@prisma/client';
import { convertStartEndTime } from 'src/interceptor/convertStartEndTime.interceptor';

import * as moment from 'moment';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}
  @Post()
  createEvent(@UserReq() user: User, @Body() body: CreateEventDto) {
    return this.eventService.createEvent(user.user_id, body);
  }
  @Get('/by-day')
  @UseInterceptors(new convertStartEndTime())
  getEventsByDay(
    @UserReq() user: User,
    @Query('date') date: string,
    @Query('timeZoneCode') timeZoneCode: string,
  ) {
    if (!date || !timeZoneCode) {
      throw new BadRequestException('Date and timeZoneCode are required');
    }

    if (!moment(date, 'YYYY-MM-DD',true).isValid()) {
      throw new BadRequestException(
        'Invalid date format. Please use YYYY-MM-DD.',
      );
    }

    if (!moment.tz.zone(timeZoneCode)) {
      throw new BadRequestException('Invalid timezone');
    }
    return this.eventService.findEventOfUserByDate(
      user.user_id,
      date,
      timeZoneCode,
    );
  }
  @Get('/by-user')
  @UseInterceptors(new convertStartEndTime())
  getEventsByUser(@UserReq() user: User) {
    return this.eventService.findEventsOfUser(user.user_id);
  }
}
