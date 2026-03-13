import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Attendance,
  AttendanceDocument,
  Employee,
  EmployeeDocument,
  EmployeeStatus,
  UserRole,
} from '../entities/index.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
  ) {}

  async getDailyReport(
    date: string,
    pagination: PaginationQueryDto,
    locationId?: string,
    employeeId?: string,
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { date };
    if (locationId) filter.location_id = new Types.ObjectId(locationId);
    if (employeeId) filter.employee_id = new Types.ObjectId(employeeId);

    const availableDates = await this.attendanceModel.distinct('date').exec();

    const [records, total] = await Promise.all([
      this.attendanceModel
        .find(filter)
        .populate('employee_id')
        .populate('location_id')
        .sort({ punch_in_time: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.attendanceModel.countDocuments(filter).exec(),
    ]);

    return {
      report_type: 'daily',
      date,
      total_records: total,
      records: records.map((r: any) => ({
        employee_name: r.employee_id?.name,
        employee_id: r.employee_id?.employee_id,
        location: r.location_id?.location_name,
        punch_in_time: r.punch_in_time,
        punch_out_time: r.punch_out_time,
        total_work_hours: r.total_work_hours,
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getWeeklyReport(
    startDate: string,
    endDate: string,
    pagination: PaginationQueryDto,
    employeeId?: string,
  ) {
    const filter: Record<string, unknown> = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (employeeId) filter.employee_id = new Types.ObjectId(employeeId);

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

      const emp = recs[0].employee_id;
      summary.push({
        employee_name: emp?.name,
        employee_id: emp?.employee_id,
        total_working_days: recs.length,
        total_hours_worked: Math.round(totalHours * 100) / 100,
        late_arrivals: 0,
      });
    }

    // Paginate summary
    const { page, limit } = pagination;
    const totalSummary = summary.length;
    const paginatedSummary = summary.slice((page - 1) * limit, page * limit);

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
      summary: paginatedSummary,
      absences,
      meta: {
        total: totalSummary,
        page,
        limit,
        total_pages: Math.ceil(totalSummary / limit),
      },
    };
  }

  async getMonthlyReport(
    year: number,
    month: number,
    pagination: PaginationQueryDto,
    employeeId?: string,
  ) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const filter: Record<string, unknown> = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (employeeId) filter.employee_id = new Types.ObjectId(employeeId);

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

    // Paginate summary
    const { page, limit } = pagination;
    const totalSummary = summary.length;
    const paginatedSummary = summary.slice((page - 1) * limit, page * limit);

    return {
      report_type: 'monthly',
      year,
      month,
      working_days_in_month: workingDays,
      summary: paginatedSummary,
      meta: {
        total: totalSummary,
        page,
        limit,
        total_pages: Math.ceil(totalSummary / limit),
      },
    };
  }
}
