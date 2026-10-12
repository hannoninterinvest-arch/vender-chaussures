export type StaffRole = "admin" | "vendeur";

export class User {
  id!: string;

  email!: string;

  name!: string;

  passwordHash!: string;

  role!: StaffRole;

  active!: boolean;

  createdAt!: Date;
}
