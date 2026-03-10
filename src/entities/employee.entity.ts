import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Employee {
  @Prop({ required: true, unique: true })
  employee_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  address: string;

  @Prop()
  joining_date: string;

  @Prop({ type: String, enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @Prop({ type: String, enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  created_at: Date;
  updated_at: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
