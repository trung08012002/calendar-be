import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateEventDto } from './dto/CreateEvent.dto';
import { EEventType } from 'src/common/interface';
import { UserService } from '../user/user.service';
import * as moment from 'moment-timezone';

@Injectable()
export class EventService extends BaseService<
  Prisma.EventCreateInput,
  Prisma.EventUpdateInput
> {
  constructor(
    private readonly userService: UserService,
    databaseService: DatabaseService,
  ) {
    super(databaseService, 'event');
  }
  findEventHaveSameStartEndTime(start_time: Date, end_time: Date) {
    return this.databaseService.event.findFirst({
      where: {
        start_time: start_time,
        end_time: end_time,
      },
    });
  }
  async createEvent(userId: number, data: CreateEventDto) {
    const result = await this.findEventHaveSameStartEndTime(
      data.start_time,
      data.end_time,
    );
    if (result) {
      throw new ConflictException('Event has same start and end time');
    }
    const event = await this.create({
      title: data.title,
      description: data.description,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      is_recurring: data.is_recurring,
      event_type: data.event_type.toString(),
      time_zone_code: data.time_zone_code,
      creator: {
        connect: {
          user_id: userId,
        },
      },
    });
    if (data.event_type === EEventType.appointment) {
      const foundUser = await this.userService.findOneOrFailByEmail(
        data.invite_email,
      );
      await this.databaseService.invitation.create({
        data: { invitee_id: foundUser.user_id, event_id: event.event_id },
      });
    }
  }
  async findEventOfUserByDate(
    userId: number,
    dateString: string,
    userTimeZoneCode: string,
  ) {
    const userDate = moment(dateString).tz(userTimeZoneCode).startOf('day');
    const foundEvents = await this.databaseService.event.findMany({
      where: {
        OR: [
          { creator_id: userId },
          {
            invitations: {
              some: {
                invitee_id: userId,
              },
            },
          },
        ],
      },
      select: {
        event_id: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        location: true,
        is_recurring: true,
        recurrence_rule: true,
        event_type: true,
        time_zone_code: true,
        created_at: true,
        updated_at: true,
        creator: {
          select: {
            user_id: true,
            email: true,
            username: true,
          },
        },
        invitations: {
          select: {
            User: {
              select: {
                user_id: true,
                email: true,
                username: true,
              },
            },
            status: true,
            sent_at: true,
          },
        },
      },
    });
    const filteredEvents = foundEvents.filter((event) => {
      const eventStart = moment(event.start_time).tz(event.time_zone_code);
      const eventEnd = moment(event.end_time).tz(event.time_zone_code);
      const eventStartInUserTZ = eventStart.clone().tz(userTimeZoneCode);
      const eventEndInUserTZ = eventEnd.clone().tz(userTimeZoneCode);
      return (
        eventStartInUserTZ.isBefore(userDate.clone().add(1, 'day')) &&
        eventEndInUserTZ.isAfter(userDate)
      );
    });
    if (filteredEvents.length === 0) {
      throw new NotFoundException('No events found');
    }
    return filteredEvents;
  }
  async findEventsOfUser(userId: number) {
    const foundEvents = await this.databaseService.event.findMany({
      where: {
        OR: [
          { creator_id: userId },
          {
            invitations: {
              some: {
                invitee_id: userId,
              },
            },
          },
        ],
      },
      select: {
        event_id: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        location: true,
        is_recurring: true,
        recurrence_rule: true,
        event_type: true,
        time_zone_code: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (foundEvents.length === 0) {
      throw new NotFoundException('No events found');
    }
    return foundEvents;
  }
}
