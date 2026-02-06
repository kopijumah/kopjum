import { defineConfig } from 'drizzle-kit';
import { getEnvSingle } from '~/shared/env';

export default defineConfig({
  schema: './src/shared/db/schema/index.ts',
  out: './src/shared/db/migration',
  dialect: 'postgresql',
  migrations: {
    prefix: 'timestamp',
    table: 'migration_versions',
    schema: 'public',
  },
  dbCredentials: {
    url: getEnvSingle('DATABASE_URL'),
  },
  strict: true,
});
