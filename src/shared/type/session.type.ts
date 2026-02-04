import { Role } from "../enum";

export type Session = {
  userId: string;
  username: string;
  role: Role;
};
