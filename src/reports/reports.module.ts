import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { Attendance, AttendanceSchema } from '../entities/attendance.entity.js';
import { Employee, EmployeeSchema } from '../entities/employee.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
