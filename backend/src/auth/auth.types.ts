import { StaffRole } from './user.entity';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
};
