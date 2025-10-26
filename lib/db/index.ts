import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialize database connection only when needed
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDbInstance() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString);
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

// Export db as a getter to maintain backward compatibility
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDbInstance()[prop as keyof ReturnType<typeof drizzle>];
  }
});