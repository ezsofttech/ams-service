import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment, AssignmentDocument } from '../entities/index.js';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from './dto/assignment.dto.js';

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

  async findAll() {
    return this.assignmentModel
      .find()
      .populate('employee_id')
      .populate('location_id')
      .sort({ created_at: -1 })
      .exec();
  }

  async findByLocation(locationId: string) {
    return this.assignmentModel
      .find({ location_id: locationId })
      .populate('employee_id')
      .populate('location_id')
      .exec();
  }

  async findByEmployee(employeeId: string) {
    return this.assignmentModel
      .find({ employee_id: employeeId })
      .populate('employee_id')
      .populate('location_id')
      .exec();
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
