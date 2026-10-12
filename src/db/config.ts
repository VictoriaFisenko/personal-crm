// Builds the Postgres connection string from environment variables.
// Values live only in .env; nothing here is ever sent to the browser.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Set it in .env`);
  }
  return value;
}

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Same variables that compose.yaml uses to start the Postgres container.
  const user = encodeURIComponent(requireEnv("POSTGRES_USER"));
  const password = encodeURIComponent(requireEnv("POSTGRES_PASSWORD"));
  const database = encodeURIComponent(requireEnv("POSTGRES_DB"));
  const host = process.env.POSTGRES_HOST || "localhost";
  const port = process.env.POSTGRES_PORT || "5432";

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}
