import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { AssignmentsModule } from './assignments/assignments.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    EmployeesModule,
    LocationsModule,
    AssignmentsModule,
    AttendanceModule,
    ReportsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
