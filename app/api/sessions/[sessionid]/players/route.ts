import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(
  req: Request,
  ctx: { params: Promise<{ sessionid: string }> }
) {
  const { sessionid } = await ctx.params

  const { playerName } = (await req.json()) as { playerName: string }
  if (!playerName || !playerName.trim()) {
    return NextResponse.json({ error: "Player name is required" }, { status: 400 })
  }

  const { rows } = await sql`
    insert into session_players (session_id, player_name)
    values (${sessionid}, ${playerName.trim()})
    on conflict (session_id, player_name)
    do update set player_name = excluded.player_name
    returning
      id,
      player_name as "name",
      total_wager as "totalWager",
      total_winnings as "totalWinnings",
      net,
      total_rake_collected as "totalRakeCollected",
      carry_loss as "carryLoss"
  `

  return NextResponse.json(rows[0])
}