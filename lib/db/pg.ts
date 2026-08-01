import { Pool } from 'pg';

// Single shared pool — all kwikbio-web API routes use this.
// Credentials mirror kwikbio-api/.env (same local Postgres on Jewel).
const pool = new Pool({
  host:     process.env.PG_HOST     ?? 'localhost',
  port:     parseInt(process.env.PG_PORT ?? '5432', 10),
  user:     process.env.PG_USER     ?? 'kwikbio',
  password: process.env.PG_PASSWORD ?? '',
  database: process.env.PG_DATABASE ?? 'kwikbio',
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export default pool;

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const { rows } = await pool.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T | null> {
  const { rows } = await pool.query(sql, params);
  return (rows[0] as T) ?? null;
}
