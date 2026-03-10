import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { Employee, EmployeeSchema } from '../entities/employee.entity.js';
import { Attendance, AttendanceSchema } from '../entities/attendance.entity.js';
import { JobLocation, JobLocationSchema } from '../entities/job-location.entity.js';
import { Assignment, AssignmentSchema } from '../entities/assignment.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: JobLocation.name, schema: JobLocationSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
