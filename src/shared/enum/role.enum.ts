export const Role = {
  ADMIN: 'ADMIN',
  WAITERS: 'WAITERS',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
