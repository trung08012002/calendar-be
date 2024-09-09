import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EEventType } from 'src/common/interface';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty({
    description: 'Description',
  })
  description: string;
  @ApiProperty({
    description: 'Start time',
  })
  @Type(() => Date)
  @IsDate()
  @Expose({ name: 'start' })
  start_time: Date;
  @ApiProperty({
    description: 'Start time',
  })
  @Type(() => Date)
  @IsDate()
  @Expose({ name: 'end' })
  end_time: Date;
  @ApiProperty({
    description: 'Is recurring',
  })
  @IsBoolean()
  is_recurring: boolean;
  @ApiProperty({
    description: 'Recurrence rule',
  })
  @IsString()
  recurrence_rule: string;
  @ApiProperty({
    description: 'Location',
  })
  @IsString()
  location: string;
  @ApiProperty({
    description: 'Event type',
    enum: [EEventType.appointment, EEventType.webinar],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([EEventType.appointment, EEventType.webinar])
  event_type: EEventType;
  @ApiProperty({
    description: 'invite email',
  })
  @IsOptional()
  @ValidateIf((o) => o.invite_email !== '')
  @IsEmail()
  @IsString()
  invite_email: string;
  @IsString()
  @IsNotEmpty()
  time_zone_code: string;
}
