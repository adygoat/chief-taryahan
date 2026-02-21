import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(
  req: Request,
  ctx: { params: Promise<{ sessionid: string }> }
) {
  const { sessionid } = await ctx.params

  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 401 })
  }

  // 🔐 Only fetch session if it belongs to this user
  const session = await sql`
    select id, name, created_at as "createdAt"
    from sessions
    where id = ${sessionid}
      and user_id = ${userId}
    limit 1
  `

  if (session.rowCount === 0) {
    // Return same shape so UI doesn't break
    return NextResponse.json({ session: null, players: [] }, { status: 404 })
  }

  // 🔐 Only fetch players for this user's session
  const players = await sql`
    select
      id,
      player_name as "name",
      total_wager as "totalWager",
      total_winnings as "totalWinnings",
      net,
      total_rake_collected as "totalRakeCollected",
      carry_loss as "carryLoss"
    from session_players
    where session_id = ${sessionid}
    order by created_at asc
  `

  return NextResponse.json({
    session: session.rows[0],
    players: players.rows,
  })
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ sessionid: string }> }
) {
  const { sessionid } = await ctx.params

  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 401 })
  }

  // 🔐 Only delete if it belongs to this user
  const { rowCount } = await sql`
    delete from sessions
    where id = ${sessionid}
      and user_id = ${userId}
  `

  if (rowCount === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}