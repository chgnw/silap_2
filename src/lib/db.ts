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

    // Set session timezone for MySQL functions like CURDATE(), NOW(), etc.
    globalForMysql.pool.on('connection', (connection) => {
      connection.query("SET time_zone='+07:00';", (err:any) => {
        if (err) {
          console.error('Error setting MySQL timezone:', err);
        }
      });
    });
  }
  return globalForMysql.pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows as T[];
}