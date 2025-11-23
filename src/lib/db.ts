import mysql, { Pool } from 'mysql2/promise';

let globalForMysql = globalThis as unknown as { pool: Pool | undefined };

export async function getPool() {
  if (!globalForMysql.pool) {
    globalForMysql.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER!,
      password: process.env.MYSQL_PASSWORD!,
      database: process.env.MYSQL_DATABASE!,
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+07:00'
    });
  }
  return globalForMysql.pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows as T[];
}