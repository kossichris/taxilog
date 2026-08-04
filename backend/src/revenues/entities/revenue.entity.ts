import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';

@Entity('revenues')
export class Revenue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  vehicle_id: string;

  @Column('uuid')
  driver_id: string;

  @Column('uuid')
  owner_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { nullable: true })
  description: string;

  @Column('date')
  date: Date;

  @Column('varchar', { default: 'PENDING' })
  status: 'PENDING' | 'SIGNED' | 'VALIDATED' | 'REJECTED';

  @Column('text', { nullable: true })
  signature: string;

  @Column('timestamp', { nullable: true })
  signed_at: Date;

  @Column('boolean', { default: false })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
