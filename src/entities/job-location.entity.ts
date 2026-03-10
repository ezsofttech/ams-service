import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobLocationDocument = HydratedDocument<JobLocation>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class JobLocation {
  @Prop({ required: true })
  location_name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  radius: number;

  created_at: Date;
  updated_at: Date;
}

export const JobLocationSchema = SchemaFactory.createForClass(JobLocation);
