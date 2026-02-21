import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  const { rows } = await sql`
    select id, name, created_at as "createdAt"
    from sessions
    order by created_at desc
    limit 200
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name: string }

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Session name is required" }, { status: 400 })
  }

  const { rows } = await sql`
    insert into sessions (name)
    values (${name.trim()})
    returning id, name, created_at as "createdAt"
  `
  return NextResponse.json(rows[0])
}