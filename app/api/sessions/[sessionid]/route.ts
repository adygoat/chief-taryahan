import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ sessionid: string }> }
) {
  const { sessionid } = await ctx.params

  const session = await sql`
    select id, name, created_at as "createdAt"
    from sessions
    where id = ${sessionid}
    limit 1
  `

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
    session: session.rows[0] ?? null,
    players: players.rows,
  })
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ sessionid: string }> }
) {
  const { sessionid } = await ctx.params

  const { rowCount } = await sql`
    delete from sessions
    where id = ${sessionid}
  `

  if (rowCount === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}