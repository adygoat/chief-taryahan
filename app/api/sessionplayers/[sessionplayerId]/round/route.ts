import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(
  req: Request,
  ctx: { params: Promise<{ sessionid: string }> }
) {
  const { sessionid } = await ctx.params

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

  const playerName = String(body?.playerName ?? "").trim()
  if (!playerName) {
    return NextResponse.json({ error: "Player name is required" }, { status: 400 })
  }

  // 🔐 Verify session belongs to this user
  const owner = await sql`
    select id
    from sessions
    where id = ${sessionid}
      and user_id = ${userId}
    limit 1
  `

  if (owner.rowCount === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  // ✅ Insert player WITH user_id
  const { rows } = await sql`
    insert into session_players (session_id, user_id, player_name)
    values (${sessionid}, ${userId}, ${playerName})
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