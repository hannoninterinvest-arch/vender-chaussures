import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type StaffRole = 'admin' | 'vendeur';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'vendeur' })
  role: StaffRole;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
