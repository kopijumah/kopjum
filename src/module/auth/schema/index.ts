
import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .min(1, { message: 'Username cannot be empty' }),

  password: z
    .string({ error: 'Password is required' })
    .trim()
    .min(1, { message: 'Password cannot be empty' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;