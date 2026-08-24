import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set — run `vercel env pull .env.local` first.');
  process.exit(1);
}

const sql = neon(databaseUrl);

await sql`
  create table if not exists traces_messages (
    id          bigserial primary key,
    name        text not null,
    message     text not null,
    ip_hash     text not null,
    created_at  timestamptz not null default now()
  )
`;

await sql`
  create index if not exists traces_messages_created_at_idx
    on traces_messages (created_at desc)
`;

console.log('traces_messages table ready.');
