import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Attendance,
  AttendanceDocument,
  JobLocation,
  JobLocationDocument,
} from '../entities/index.js';
import { PunchInDto, PunchOutDto } from './dto/attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(JobLocation.name)
    private locationModel: Model<JobLocationDocument>,
  ) {}

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async punchIn(employeeId: string, dto: PunchInDto) {
    const today = new Date().toISOString().split('T')[0];

    // Check if already punched in today
    const existing = await this.attendanceModel.findOne({
      employee_id: employeeId,
      date: today,
    });
    if (existing) {
      throw new BadRequestException('Already punched in today');
    }

    // Validate location
    const location = await this.locationModel.findById(dto.location_id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Check if within radius
    const distance = this.calculateDistance(
      dto.latitude,
      dto.longitude,
      location.latitude,
      location.longitude,
    );
    if (distance > location.radius) {
      throw new BadRequestException(
        `You are ${Math.round(distance)}m away from the location. Must be within ${location.radius}m.`,
      );
    }

    return this.attendanceModel.create({
      employee_id: employeeId,
      location_id: dto.location_id,
      date: today,
      punch_in_time: new Date(),
      punch_in_lat: dto.latitude,
      punch_in_long: dto.longitude,
      device_info: dto.device_info,
    });
  }

  async punchOut(employeeId: string, dto: PunchOutDto) {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceModel.findOne({
      employee_id: employeeId,
      date: today,
    });
    if (!attendance) {
      throw new BadRequestException('No punch-in record found for today');
    }
    if (attendance.punch_out_time) {
      throw new BadRequestException('Already punched out today');
    }

    const punchOutTime = new Date();
    const totalHours =
      (punchOutTime.getTime() - new Date(attendance.punch_in_time).getTime()) /
      (1000 * 60 * 60);

    attendance.punch_out_time = punchOutTime;
    attendance.punch_out_lat = dto.latitude;
    attendance.punch_out_long = dto.longitude;
    attendance.total_work_hours = Math.round(totalHours * 100) / 100;

    return attendance.save();
  }

  async getTodayStatus(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await this.attendanceModel
      .findOne({ employee_id: employeeId, date: today })
      .populate('location_id')
      .exec();
    return {
      date: today,
      status: attendance
        ? attendance.punch_out_time
          ? 'completed'
          : 'punched_in'
        : 'not_punched_in',
      attendance,
    };
  }

  async getHistory(employeeId: string, startDate?: string, endDate?: string) {
    const filter: Record<string, unknown> = { employee_id: employeeId };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    return this.attendanceModel
      .find(filter)
      .populate('location_id')
      .sort({ date: -1 })
      .exec();
  }

  async getAllAttendance(date?: string) {
    const filter: Record<string, unknown> = {};
    if (date) {
      filter.date = date;
    }
    return this.attendanceModel
      .find(filter)
      .populate('employee_id')
      .populate('location_id')
      .sort({ date: -1, punch_in_time: -1 })
      .exec();
  }

  async getAttendanceDetail(id: string) {
    const attendance = await this.attendanceModel
      .findById(id)
      .populate('employee_id')
      .populate('location_id')
      .exec();
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    return attendance;
  }
}
