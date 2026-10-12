import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseUrl } from "./config";
import * as schema from "./schema";

// Reuse one pool across hot reloads in development instead of leaking connections.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

function createPool(): Pool {
  const pool = new Pool({ connectionString: getDatabaseUrl() });

  // Idle connections break when Postgres restarts. Without a listener that
  // error would crash the whole server; the next query simply reconnects.
  pool.on("error", (error) => {
    console.error("Idle database connection failed:", error.message);
  });

  return pool;
}

const pool = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle({ client: pool, schema });
