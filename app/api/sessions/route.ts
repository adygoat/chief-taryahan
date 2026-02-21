import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(req: Request) {
  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 401 })
  }

  const { rows } = await sql`
    select id, name, created_at as "createdAt"
    from sessions
    where user_id = ${userId}
    order by created_at desc
    limit 200
  `

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = String(body?.name ?? "").trim()
  if (!name) {
    return NextResponse.json({ error: "Session name is required" }, { status: 400 })
  }

  const { rows } = await sql`
    insert into sessions (name, user_id)
    values (${name}, ${userId})
    returning id, name, created_at as "createdAt"
  `

  return NextResponse.json(rows[0])
}