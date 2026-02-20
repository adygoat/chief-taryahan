"use client"

import { useState, useCallback } from "react"
import { CasinoHeader } from "@/components/casino/header"
import { RakeSettings } from "@/components/casino/rake-settings"
import { AddPlayerForm } from "@/components/casino/add-player-form"
import { PlayerTable, type Player } from "@/components/casino/player-table"
import { StatsBar } from "@/components/casino/stats-bar"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export default function CasinoPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [rake, setRake] = useState(5)

  const addPlayer = useCallback((name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      wager: 0,
      winnings: 0,
      net: 0,
      totalRakeCollected: 0,
      totalWager: 0,
      totalWinnings: 0,
      carryLoss: 0, // ✅ NEW
    }
    setPlayers((prev) => [...prev, newPlayer])
  }, [])

  const submitRound = useCallback(
    (id: string, wager: number, winnings: number) => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p

          const roundNetBeforeRake = winnings - wager

          // ✅ Profit eligible for rake only after clearing previous losses
          const profitEligibleForRake = Math.max(0, roundNetBeforeRake - p.carryLoss)

          // ✅ Rake only on true profit
          const rakeDeduction =
            profitEligibleForRake > 0 ? (profitEligibleForRake * rake) / 100 : 0

          const roundNet = roundNetBeforeRake - rakeDeduction

          // ✅ Update carryLoss (breakeven across rounds -> carryLoss becomes 0)
          let newCarryLoss = p.carryLoss
          if (roundNetBeforeRake < 0) {
            newCarryLoss += Math.abs(roundNetBeforeRake)
          } else {
            newCarryLoss = Math.max(0, newCarryLoss - roundNetBeforeRake)
          }

          return {
            ...p,
            wager: 0,
            winnings: 0,
            net: p.net + roundNet,
            carryLoss: newCarryLoss,
            totalRakeCollected: p.totalRakeCollected + rakeDeduction,
            totalWager: p.totalWager + wager,
            totalWinnings: p.totalWinnings + winnings,
          }
        })
      )
    },
    [rake]
  )

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    setPlayers([])
    setRake(5)
  }, [])

  const totalRakeCollected = players.reduce((sum, p) => sum + p.totalRakeCollected, 0)
  const grandTotalWager = players.reduce((sum, p) => sum + p.totalWager, 0)
  const grandTotalWinnings = players.reduce((sum, p) => sum + p.totalWinnings, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 pb-12">
        <CasinoHeader />

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RakeSettings rake={rake} onRakeChange={setRake} totalRakeCollected={totalRakeCollected} />
            <AddPlayerForm onAddPlayer={addPlayer} existingNames={players.map((p) => p.name)} />
          </div>

          <PlayerTable players={players} onSubmitRound={submitRound} onRemovePlayer={removePlayer} rake={rake} />

          {players.length > 0 && <StatsBar totalWager={grandTotalWager} totalWinnings={grandTotalWinnings} />}

          {players.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={resetAll}
                className="border-border text-muted-foreground hover:text-loss hover:border-loss/30 hover:bg-loss/5"
              >
                <RotateCcw className="size-4" />
                Reset Table
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">Taryahan ni Chief &middot; Wala kang patawad ya</p>
        </footer>
      </div>
    </main>
  )
}