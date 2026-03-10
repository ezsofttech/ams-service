import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Attendance,
  AttendanceDocument,
  Employee,
  EmployeeDocument,
  EmployeeStatus,
  UserRole,
} from '../entities/index.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
  ) {}

  async getDailyReport(date: string, locationId?: string, employeeId?: string) {
    const filter: Record<string, unknown> = { date };
    if (locationId) filter.location_id = locationId;
    if (employeeId) filter.employee_id = employeeId;

    const records = await this.attendanceModel
      .find(filter)
      .populate('employee_id')
      .populate('location_id')
      .sort({ punch_in_time: 1 })
      .exec();

    return {
      report_type: 'daily',
      date,
      total_records: records.length,
      records: records.map((r: any) => ({
        employee_name: r.employee_id?.name,
        employee_id: r.employee_id?.employee_id,
        location: r.location_id?.location_name,
        punch_in_time: r.punch_in_time,
        punch_out_time: r.punch_out_time,
        total_work_hours: r.total_work_hours,
      })),
    };
  }

  async getWeeklyReport(
    startDate: string,
    endDate: string,
    employeeId?: string,
  ) {
    const filter: Record<string, unknown> = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (employeeId) filter.employee_id = employeeId;

    const records = await this.attendanceModel
      .find(filter)
      .populate('employee_id')
      .populate('location_id')
      .sort({ date: 1 })
      .exec();

    // Group by employee
    const employeeMap = new Map<string, any[]>();
    for (const r of records) {
      const key = r.employee_id?.toString() || '';
      if (!employeeMap.has(key)) employeeMap.set(key, []);
      employeeMap.get(key)!.push(r);
    }

    const summary: {
      employee_name: string | undefined;
      employee_id: string | undefined;
      total_working_days: number;
      total_hours_worked: number;
      late_arrivals: number;
    }[] = [];
    for (const [, recs] of employeeMap) {
      const totalHours = recs.reduce(
        (sum: number, r: any) => sum + (r.total_work_hours || 0),
        0,
      );
      const lateArrivals = recs.filter((r: any) => {
        const loc = r.location_id;
        if (!loc?.shift_start) return false;
        const [h, m] = loc.shift_start.split(':').map(Number);
        const shiftStart = new Date(r.punch_in_time);
        shiftStart.setHours(h, m, 0, 0);
        return new Date(r.punch_in_time) > shiftStart;
      }).length;

      const emp = recs[0].employee_id;
      summary.push({
        employee_name: emp?.name,
        employee_id: emp?.employee_id,
        total_working_days: recs.length,
        total_hours_worked: Math.round(totalHours * 100) / 100,
        late_arrivals: lateArrivals,
      });
    }

    // Calculate absences
    const allEmployees = await this.employeeModel
      .find({ role: UserRole.EMPLOYEE, status: EmployeeStatus.ACTIVE })
      .exec();
    const presentIds = new Set(employeeMap.keys());
    const absences = allEmployees
      .filter((e) => !presentIds.has(e._id.toString()))
      .map((e) => ({ employee_name: e.name, employee_id: e.employee_id }));

    return {
      report_type: 'weekly',
      start_date: startDate,
      end_date: endDate,
      summary,
      absences,
    };
  }

  async getMonthlyReport(year: number, month: number, employeeId?: string) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const filter: Record<string, unknown> = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (employeeId) filter.employee_id = employeeId;

    const records = await this.attendanceModel
      .find(filter)
      .populate('employee_id')
      .populate('location_id')
      .exec();

    // Group by employee
    const employeeMap = new Map<string, any[]>();
    for (const r of records) {
      const key = r.employee_id?.toString() || '';
      if (!employeeMap.has(key)) employeeMap.set(key, []);
      employeeMap.get(key)!.push(r);
    }

    // Calculate working days in month (excluding weekends)
    let workingDays = 0;
    for (let d = 1; d <= lastDay; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }

    const summary: {
      employee_name: string | undefined;
      employee_id: string | undefined;
      total_attendance: number;
      total_working_days: number;
      missed_days: number;
      total_hours_worked: number;
    }[] = [];
    for (const [, recs] of employeeMap) {
      const totalHours = recs.reduce(
        (sum: number, r: any) => sum + (r.total_work_hours || 0),
        0,
      );
      const uniqueDays = new Set(recs.map((r: any) => r.date)).size;
      const emp = recs[0].employee_id;

      summary.push({
        employee_name: emp?.name,
        employee_id: emp?.employee_id,
        total_attendance: uniqueDays,
        total_working_days: workingDays,
        missed_days: workingDays - uniqueDays,
        total_hours_worked: Math.round(totalHours * 100) / 100,
      });
    }

    return {
      report_type: 'monthly',
      year,
      month,
      working_days_in_month: workingDays,
      summary,
    };
  }
}
