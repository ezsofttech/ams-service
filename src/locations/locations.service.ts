import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobLocation, JobLocationDocument } from '../entities/index.js';
import {
  CreateJobLocationDto,
  UpdateJobLocationDto,
} from './dto/location.dto.js';
import {
  PaginationQueryDto,
  paginate,
} from '../common/dto/pagination.dto.js';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(JobLocation.name)
    private locationModel: Model<JobLocationDocument>,
  ) {}

  async create(dto: CreateJobLocationDto) {
    return this.locationModel.create(dto);
  }

  async findAll(pagination: PaginationQueryDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.locationModel
        .find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.locationModel.countDocuments().exec(),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  async update(id: string, dto: UpdateJobLocationDto) {
    const location = await this.locationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  async remove(id: string) {
    const location = await this.locationModel.findByIdAndDelete(id).exec();
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return { message: 'Location deleted successfully' };
  }
}
