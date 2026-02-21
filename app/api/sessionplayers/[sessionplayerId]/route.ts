import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ sessionplayerId: string }> }
) {
  const { sessionplayerId } = await ctx.params

  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 401 })
  }

  // 🔐 Only delete if this player belongs to a session owned by this user
  const { rowCount } = await sql`
    delete from session_players sp
    using sessions s
    where sp.id = ${sessionplayerId}
      and s.id = sp.session_id
      and s.user_id = ${userId}
  `

  if (rowCount === 0) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}