import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../entities/employee.entity.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'boss-security-jwt-secret',
      ),
    });
  }

  async validate(payload: { sub: string; role: string }) {
    const employee = await this.employeeModel.findById(payload.sub).exec();
    if (!employee) {
      throw new UnauthorizedException();
    }
    return {
      id: employee._id.toString(),
      employee_id: employee.employee_id,
      role: employee.role,
      name: employee.name,
    };
  }
}
