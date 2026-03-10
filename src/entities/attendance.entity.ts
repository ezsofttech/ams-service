import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobLocation', required: true })
  location_id: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  punch_in_time: Date;

  @Prop({ required: true })
  punch_in_lat: number;

  @Prop({ required: true })
  punch_in_long: number;

  @Prop()
  punch_out_time: Date;

  @Prop()
  punch_out_lat: number;

  @Prop()
  punch_out_long: number;

  @Prop()
  total_work_hours: number;

  @Prop()
  device_info: string;

  created_at: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
