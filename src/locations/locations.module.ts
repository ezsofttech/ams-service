import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsController } from './locations.controller.js';
import { LocationsService } from './locations.service.js';
import { JobLocation, JobLocationSchema } from '../entities/job-location.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: JobLocation.name, schema: JobLocationSchema }]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
