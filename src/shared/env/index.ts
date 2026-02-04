const Environment = {
  DatabaseUrl: 'DATABASE_URL',
  SessionKey: 'SESSION_KEY',
  WhitelistAdmin: 'WHITELIST_ADMIN',
  WhitelistWaiter: 'WHITELIST_WAITER',
} as const;

type Environment = (typeof Environment)[keyof typeof Environment];

export function getEnvSingle(key: Environment): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`missing environment variable ${key}`);
  }

  return value;
}

export function getEnvMulti(key: Environment): string[] {
  const values = process.env[key];
  if (!values) {
    throw new Error(`missing environment variable ${key}`);
  }

  return values.split(',');
}
