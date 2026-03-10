import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from '../entities/index.js';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from './dto/assignment.dto.js';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination.dto.js';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
  ) {}

  async create(dto: CreateAssignmentDto) {
    const assignment = await this.assignmentModel.create({
      ...dto,
      assigned_date:
        dto.assigned_date || new Date().toISOString().split('T')[0],
    });
    return assignment.populate(['employee_id', 'location_id']);
  }

  async findAll(pagination: PaginationQueryDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.assignmentModel
        .find()
        .populate('employee_id')
        .populate('location_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments().exec(),
    ]);

    return paginate(data, total, page, limit);
  }

  async findByLocation(locationId: string, pagination: PaginationQueryDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const filter = { location_id: locationId };

    const [data, total] = await Promise.all([
      this.assignmentModel
        .find(filter)
        .populate('employee_id')
        .populate('location_id')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments(filter).exec(),
    ]);

    return paginate(data, total, page, limit);
  }

  async findByEmployee(employeeId: string, pagination: PaginationQueryDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const filter = { employee_id: employeeId };

    const [data, total] = await Promise.all([
      this.assignmentModel
        .find(filter)
        .populate('employee_id')
        .populate('location_id')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentModel.countDocuments(filter).exec(),
    ]);

    return paginate(data, total, page, limit);
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const assignment = await this.assignmentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('employee_id')
      .populate('location_id')
      .exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async remove(id: string) {
    const assignment = await this.assignmentModel.findByIdAndDelete(id).exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return { message: 'Assignment removed successfully' };
  }
}
