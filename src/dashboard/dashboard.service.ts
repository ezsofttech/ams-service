import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Employee,
  EmployeeDocument,
  Attendance,
  AttendanceDocument,
  JobLocation,
  JobLocationDocument,
  UserRole,
  EmployeeStatus,
} from '../entities/index.js';
import {
  Assignment,
  AssignmentDocument,
} from '../entities/assignment.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(JobLocation.name)
    private locationModel: Model<JobLocationDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
  ) {}

  async getAdminDashboard() {
    const today = new Date().toISOString().split('T')[0];

    const totalEmployees = await this.employeeModel.countDocuments({
      role: UserRole.EMPLOYEE,
    });

    const activeEmployees = await this.employeeModel.countDocuments({
      role: UserRole.EMPLOYEE,
      status: EmployeeStatus.ACTIVE,
    });

    const todayAttendance = await this.attendanceModel
      .find({ date: today })
      .populate('employee_id')
      .populate('location_id')
      .sort({ punch_in_time: -1 })
      .exec();

    const punchedInToday = todayAttendance.length;
    const absentGuards = activeEmployees - punchedInToday;

    const activeLocations = await this.locationModel.countDocuments();

    // Recent activity feed (last 10)
    const recentLogs = todayAttendance.slice(0, 10).map((a: any) => ({
      employee_name: a.employee_id?.name,
      location_name: a.location_id?.location_name,
      punch_in_time: a.punch_in_time,
      punch_out_time: a.punch_out_time,
      status: a.punch_out_time ? 'punched_out' : 'punched_in',
    }));

    return {
      total_employees: totalEmployees,
      active_guards: activeEmployees,
      punched_in_today: punchedInToday,
      absent_guards: absentGuards,
      active_locations: activeLocations,
      recent_activity: recentLogs,
    };
  }

  async getEmployeeDashboard(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get current assignment
    const assignment = await this.assignmentModel
      .findOne({ employee_id: employeeId })
      .populate('location_id')
      .sort({ created_at: -1 })
      .exec();

    // Get today's attendance
    const todayAttendance = await this.attendanceModel
      .findOne({ employee_id: employeeId, date: today })
      .populate('location_id')
      .exec();

    const employee = await this.employeeModel
      .findById(employeeId)
      .select('employee_id name email phone')
      .exec();

    return {
      employee,
      assigned_location: (assignment as any)?.location_id || null,
      shift_timing: assignment
        ? { start: assignment.shift_start, end: assignment.shift_end }
        : null,
      today: {
        date: today,
        status: todayAttendance
          ? todayAttendance.punch_out_time
            ? 'completed'
            : 'punched_in'
          : 'not_punched_in',
        attendance: todayAttendance,
      },
    };
  }
}
