// src/types/auth.ts
import { z } from "zod";
import { RoleName, UserPublic } from "../types";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginBody = z.infer<typeof LoginSchema>;

export type JwtUser = { id: string; email: string; roles: RoleName[] };

export function toUserPublic(u: {
  id: string;
  email: string;
  fullName: string;
  roles: { role: string }[];
}): UserPublic {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    roles: u.roles.map((r) => r.role as RoleName),
  };
}
