import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(
  req: Request,
  ctx: { params: Promise<{ sessionplayerId: string }> }
) {
  const { sessionplayerId } = await ctx.params

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

  // 1) Load current carry_loss (and ensure player exists)
  const current = await sql`
    select carry_loss
    from session_players
    where id = ${sessionplayerId}
    limit 1
  `

  if (current.rowCount === 0) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 })
  }

  const carryLoss = Number(current.rows[0].carry_loss) || 0

  // 2) Compute round values
  const roundNetBeforeRake = winnings - wager

  // Rake only applies to profit AFTER clearing previous losses
  const profitEligibleForRake = Math.max(0, roundNetBeforeRake - carryLoss)
  const rakeDeduction =
    profitEligibleForRake > 0 ? (profitEligibleForRake * rakePercent) / 100 : 0

  const roundNet = roundNetBeforeRake - rakeDeduction

  // 3) Update carryLoss:
  // - If loss this round, add to carryLoss
  // - If win, reduce carryLoss until it reaches 0 (breakeven => 0)
  let newCarryLoss = carryLoss
  if (roundNetBeforeRake < 0) {
    newCarryLoss += Math.abs(roundNetBeforeRake)
  } else {
    newCarryLoss = Math.max(0, newCarryLoss - roundNetBeforeRake)
  }

  // 4) Persist totals + return updated row in camelCase keys
  const updated = await sql`
    update session_players
    set
      total_wager = total_wager + ${wager},
      total_winnings = total_winnings + ${winnings},
      net = net + ${roundNet},
      total_rake_collected = total_rake_collected + ${rakeDeduction},
      carry_loss = ${newCarryLoss}
    where id = ${sessionplayerId}
    returning
      id,
      player_name as "name",
      total_wager as "totalWager",
      total_winnings as "totalWinnings",
      net,
      total_rake_collected as "totalRakeCollected",
      carry_loss as "carryLoss"
  `

  return NextResponse.json(updated.rows[0])
}