import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument, UserRole } from '../entities/index.js';
import {
  LoginDto,
  RegisterAdminDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    let employee = await this.employeeModel
      .findOne({ email: dto.identifier })
      .exec();
    if (!employee) {
      employee = await this.employeeModel
        .findOne({ employee_id: dto.identifier })
        .exec();
    }
    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      employee.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: employee._id.toString(),
      role: employee.role,
      employee_id: employee.employee_id,
    };
    return {
      access_token: this.generateAccessToken(payload),
      refresh_token: this.generateRefreshToken(payload),
      user: {
        id: employee._id.toString(),
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    };
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const existing = await this.employeeModel
      .findOne({ email: dto.email })
      .exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const count = await this.employeeModel.countDocuments().exec();
    const employeeId = `BOSS-ADM-${String(count + 1).padStart(4, '0')}`;

    const admin = await this.employeeModel.create({
      ...dto,
      password: hashedPassword,
      employee_id: employeeId,
      role: UserRole.ADMIN,
      joining_date: new Date().toISOString().split('T')[0],
    });

    const payload = {
      sub: admin._id.toString(),
      role: admin.role,
      employee_id: admin.employee_id,
    };
    return {
      access_token: this.generateAccessToken(payload),
      refresh_token: this.generateRefreshToken(payload),
      user: {
        id: admin._id.toString(),
        employee_id: admin.employee_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const employee = await this.employeeModel.findById(userId).exec();
    if (!employee) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(
      dto.current_password,
      employee.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    employee.password = await bcrypt.hash(dto.new_password, 10);
    await employee.save();
    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    const employee = await this.employeeModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!employee) {
      throw new UnauthorizedException('User not found');
    }
    return employee;
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const employee = await this.employeeModel
        .findById(payload.sub)
        .exec();
      if (!employee) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: employee._id.toString(),
        role: employee.role,
        employee_id: employee.employee_id,
      };

      return {
        access_token: this.generateAccessToken(newPayload),
        refresh_token: this.generateRefreshToken(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateAccessToken(payload: Record<string, string>) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    } as any);
  }

  private generateRefreshToken(payload: Record<string, string>) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ),
    } as any);
  }
}
