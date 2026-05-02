// src/types/auth.ts
import { z } from "zod";
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export function toUserPublic(u) {
    return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        roles: u.roles.map((r) => r.role),
    };
}
