import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  Employee,
  EmployeeDocument,
  EmployeeStatus,
  UserRole,
} from '../entities/index.js';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto.js';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination.dto.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(dto: CreateEmployeeDto) {
    const existing = await this.employeeModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const count = await this.employeeModel.countDocuments().exec();
    const employeeId = `BOSS-EMP-${String(count + 1).padStart(4, '0')}`;
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const employee = await this.employeeModel.create({
      ...dto,
      password: hashedPassword,
      employee_id: employeeId,
      role: UserRole.EMPLOYEE,
      joining_date: dto.joining_date || new Date().toISOString().split('T')[0],
    });

    const { password: _, ...result } = employee.toObject();
    return result;
  }

  async findAll(pagination: PaginationQueryDto, search?: string) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { role: UserRole.EMPLOYEE };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employee_id: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.employeeModel
        .find(filter)
        .select('-password')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.employeeModel.countDocuments(filter).exec(),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const employee = await this.employeeModel
      .findById(id)
      .select('-password')
      .exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password')
      .exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async deactivate(id: string) {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    employee.status = EmployeeStatus.INACTIVE;
    await employee.save();
    return { message: 'Employee deactivated successfully' };
  }
}
