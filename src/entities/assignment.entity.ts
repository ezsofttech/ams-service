import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssignmentDocument = HydratedDocument<Assignment>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobLocation', required: true })
  location_id: Types.ObjectId;

  @Prop({ required: true })
  assigned_date: string;

  created_at: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
