"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface StatsBarProps {
  totalWager: number
  totalWinnings: number
}

export function StatsBar({ totalWager, totalWinnings }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-primary/20 bg-card">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex items-center justify-center size-11 rounded-xl bg-loss/10 border border-loss/20 shrink-0">
            <ArrowDownCircle className="size-5 text-loss" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Wagered
            </span>
            <span className="text-xl font-bold text-foreground font-mono truncate">
              {'₱'}{totalWager.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-card">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex items-center justify-center size-11 rounded-xl bg-success/10 border border-success/20 shrink-0">
            <ArrowUpCircle className="size-5 text-success" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Winnings
            </span>
            <span className="text-xl font-bold text-foreground font-mono truncate">
              {'₱'}{totalWinnings.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
