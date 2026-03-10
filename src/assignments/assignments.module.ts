import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentsController } from './assignments.controller.js';
import { AssignmentsService } from './assignments.service.js';
import { Assignment, AssignmentSchema } from '../entities/assignment.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Assignment.name, schema: AssignmentSchema }]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
