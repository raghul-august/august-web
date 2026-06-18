import { Pool } from "pg";

if (!process.env.POSTGRES_HOST) {
  throw new Error(
    'POSTGRES_HOST is not defined. Set POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD in .env.'
  );
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true, ca: process.env.POSTGRES_CA_CERT }
      : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Postgres pool: unexpected error on idle client", err);
});

export default pool;
