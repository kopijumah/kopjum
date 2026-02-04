import * as schema from '~/shared/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnvSingle } from '../env';

const pool = new Pool({
  connectionString: getEnvSingle('DATABASE_URL'),
});

export const db = drizzle(pool, { schema, casing: 'snake_case' });

export type DB = typeof db;