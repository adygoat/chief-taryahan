import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(
  req: Request,
  ctx: { params: Promise<{ sessionplayerId: string }> }
) {
  const { sessionplayerId } = await ctx.params

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

  const wager = Number(body?.wager)
  const winnings = Number(body?.winnings)
  const rakePercent = Number(body?.rakePercent)

  if (![wager, winnings, rakePercent].every((n) => Number.isFinite(n))) {
    return NextResponse.json(
      { error: "wager, winnings, and rakePercent must be numbers" },
      { status: 400 }
    )
  }

  if (wager < 0 || winnings < 0 || rakePercent < 0) {
    return NextResponse.json(
      { error: "wager/winnings/rakePercent cannot be negative" },
      { status: 400 }
    )
  }

  // 🔐 Ensure this player belongs to a session owned by this user
  const current = await sql`
    select sp.carry_loss
    from session_players sp
    join sessions s on s.id = sp.session_id
    where sp.id = ${sessionplayerId}
      and s.user_id = ${userId}
    limit 1
  `

  if (current.rowCount === 0) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 })
  }

  const carryLoss = Number(current.rows[0].carry_loss) || 0

  // === Calculation ===

  const roundNetBeforeRake = winnings - wager

  const profitEligibleForRake = Math.max(0, roundNetBeforeRake - carryLoss)

  const rakeDeduction =
    profitEligibleForRake > 0
      ? (profitEligibleForRake * rakePercent) / 100
      : 0

  const roundNet = roundNetBeforeRake - rakeDeduction

  let newCarryLoss = carryLoss
  if (roundNetBeforeRake < 0) {
    newCarryLoss += Math.abs(roundNetBeforeRake)
  } else {
    newCarryLoss = Math.max(0, newCarryLoss - roundNetBeforeRake)
  }

  const updated = await sql`
    update session_players sp
    set
      total_wager = total_wager + ${wager},
      total_winnings = total_winnings + ${winnings},
      net = net + ${roundNet},
      total_rake_collected = total_rake_collected + ${rakeDeduction},
      carry_loss = ${newCarryLoss}
    from sessions s
    where sp.id = ${sessionplayerId}
      and s.id = sp.session_id
      and s.user_id = ${userId}
    returning
      sp.id,
      sp.player_name as "name",
      sp.total_wager as "totalWager",
      sp.total_winnings as "totalWinnings",
      sp.net,
      sp.total_rake_collected as "totalRakeCollected",
      sp.carry_loss as "carryLoss"
  `

  return NextResponse.json(updated.rows[0])
}