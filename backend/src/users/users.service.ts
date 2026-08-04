import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: {
    phone: string;
    password: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    const existing = await this.findByPhone(data.phone);
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      phone: data.phone,
      password_hash,
      name: data.name,
      role: data.role || Role.OWNER,
    });

    return this.usersRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }
}
