"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Users, TrendingUp, TrendingDown, Minus, Check } from "lucide-react"

export interface Player {
  id: string
  name: string
  wager: number
  winnings: number
  net: number
  totalRakeCollected: number
  totalWager: number
  totalWinnings: number
}

interface PlayerTableProps {
  players: Player[]
  onSubmitRound: (id: string, wager: number, winnings: number) => void
  onRemovePlayer: (id: string) => void
  rake: number
}

function NetBadge({ net }: { net: number }) {
  if (net > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
        <TrendingUp className="size-3" />
        +{'₱'}{net.toFixed(2)}
      </span>
    )
  }
  if (net < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-loss/15 px-2.5 py-0.5 text-xs font-semibold text-loss">
        <TrendingDown className="size-3" />
        -{'₱'}{Math.abs(net).toFixed(2)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
      <Minus className="size-3" />
      {'₱'}0.00
    </span>
  )
}

function PlayerRow({
  player,
  rake,
  onSubmitRound,
  onRemovePlayer,
}: {
  player: Player
  rake: number
  onSubmitRound: (id: string, wager: number, winnings: number) => void
  onRemovePlayer: (id: string) => void
}) {
  const [wager, setWager] = useState("")
  const [winnings, setWinnings] = useState("")

  const handleSubmit = () => {
    const w = parseFloat(wager) || 0
    const win = parseFloat(winnings) || 0
    if (w <= 0 && win <= 0) return
    onSubmitRound(player.id, w, win)
    setWager("")
    setWinnings("")
  }

  const hasInput = (parseFloat(wager) || 0) > 0 || (parseFloat(winnings) || 0) > 0
  const previewWin = parseFloat(winnings) || 0
  const previewWager = parseFloat(wager) || 0
  const previewRakeDeduction = previewWin > 0 ? (previewWin * rake) / 100 : 0
  const previewRoundNet = previewWin - previewWager - previewRakeDeduction
  const previewTotalNet = player.net + previewRoundNet

  return (
    <div className="group rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-colors">
      {/* Desktop Row */}
      <div className="hidden md:grid md:grid-cols-[1fr_120px_120px_120px_36px_36px] gap-3 items-center p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary shrink-0">
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground truncate">{player.name}</span>
            {hasInput && (
              <span className="text-[10px] text-muted-foreground">
                {'Round: '}
                <span className={previewRoundNet >= 0 ? "text-success" : "text-loss"}>
                  {previewRoundNet >= 0 ? "+" : ""}{previewRoundNet.toFixed(2)}
                </span>
                {previewRakeDeduction > 0 && (
                  <span className="text-primary/60 ml-1">
                    {'(rake: ₱'}{previewRakeDeduction.toFixed(2)}{')'}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={wager}
          onChange={(e) => setWager(e.target.value)}
          placeholder="0.00"
          className="h-9 bg-background border-border text-foreground font-mono text-sm"
          aria-label={`Wager for ${player.name}`}
        />
        <Input
          type="number"
          min={0}
          step={0.01}
          value={winnings}
          onChange={(e) => setWinnings(e.target.value)}
          placeholder="0.00"
          className="h-9 bg-background border-border text-foreground font-mono text-sm"
          aria-label={`Winnings for ${player.name}`}
        />
        <div className="flex justify-center">
          <NetBadge net={hasInput ? previewTotalNet : player.net} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSubmit}
          disabled={!hasInput}
          className="size-8 text-success hover:text-success hover:bg-success/10 disabled:opacity-30"
          aria-label={`Submit round for ${player.name}`}
        >
          <Check className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemovePlayer(player.id)}
          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-loss hover:bg-loss/10"
          aria-label={`Remove ${player.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Mobile Card */}
      <div className="md:hidden p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary shrink-0">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-foreground">{player.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <NetBadge net={hasInput ? previewTotalNet : player.net} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemovePlayer(player.id)}
              className="size-8 text-muted-foreground hover:text-loss hover:bg-loss/10"
              aria-label={`Remove ${player.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{'Wager (₱)'}</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              placeholder="0.00"
              className="h-9 bg-background border-border text-foreground font-mono text-sm"
              aria-label={`Wager for ${player.name}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{'Winnings (₱)'}</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={winnings}
              onChange={(e) => setWinnings(e.target.value)}
              placeholder="0.00"
              className="h-9 bg-background border-border text-foreground font-mono text-sm"
              aria-label={`Winnings for ${player.name}`}
            />
          </div>
        </div>
        {hasInput && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              {'Round: '}
              <span className={previewRoundNet >= 0 ? "text-success" : "text-loss"}>
                {previewRoundNet >= 0 ? "+" : ""}{'₱'}{previewRoundNet.toFixed(2)}
              </span>
              {previewRakeDeduction > 0 && (
                <span className="text-primary/60 ml-1">
                  {'(rake: ₱'}{previewRakeDeduction.toFixed(2)}{')'}
                </span>
              )}
            </span>
          </div>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!hasInput}
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
        >
          <Check className="size-4 mr-2" />
          Submit Round
        </Button>
      </div>
    </div>
  )
}

export function PlayerTable({ players, onSubmitRound, onRemovePlayer, rake }: PlayerTableProps) {
  if (players.length === 0) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-secondary border border-border">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">No players yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add players above to start tracking
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">
              Players
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({players.length})
              </span>
            </CardTitle>
            <CardDescription>Enter wagers and winnings per round, then submit</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 md:px-6">
        {/* Desktop Header */}
        <div className="hidden md:grid md:grid-cols-[1fr_120px_120px_120px_36px_36px] gap-3 items-center px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Player</span>
          <span>{'Wager (₱)'}</span>
          <span>{'Winnings (₱)'}</span>
          <span className="text-center">Net</span>
          <span></span>
          <span></span>
        </div>

        {players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            rake={rake}
            onSubmitRound={onSubmitRound}
            onRemovePlayer={onRemovePlayer}
          />
        ))}
      </CardContent>
    </Card>
  )
}
