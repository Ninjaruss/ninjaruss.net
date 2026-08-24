import { neon } from '@neondatabase/serverless';

// Lazy singleton: calling neon() at module load time would throw if
// DATABASE_URL isn't set yet (e.g. during `astro build` before the env
// var is configured). A plain lazy `let` avoids that — no Proxy, which
// breaks libraries that probe the wrapped object's shape.
let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export interface TraceRow {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export async function insertMessage(name: string, message: string, ipHash: string): Promise<TraceRow> {
  const sql = getSql();
  const rows = await sql`
    insert into traces_messages (name, message, ip_hash)
    values (${name}, ${message}, ${ipHash})
    returning id, name, message, created_at
  ` as any[];
  return rows[0] as TraceRow;
}

export async function listMessages(limit?: number): Promise<TraceRow[]> {
  const sql = getSql();
  const rows = limit
    ? (await sql`select id, name, message, created_at from traces_messages order by created_at desc limit ${limit}` as any[])
    : (await sql`select id, name, message, created_at from traces_messages order by created_at desc` as any[]);
  return rows as TraceRow[];
}

export async function lastSubmissionByIpHash(ipHash: string): Promise<Date | null> {
  const sql = getSql();
  const rows = await sql`
    select created_at from traces_messages
    where ip_hash = ${ipHash}
    order by created_at desc
    limit 1
  ` as any[];
  return rows[0] ? new Date(rows[0].created_at as string) : null;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`delete from traces_messages where id = ${id} returning id` as any[];
  return rows.length > 0;
}
