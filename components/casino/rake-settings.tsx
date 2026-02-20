"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Percent } from "lucide-react"

interface RakeSettingsProps {
  rake: number
  onRakeChange: (value: number) => void
  totalRakeCollected: number
}

export function RakeSettings({ rake, onRakeChange, totalRakeCollected }: RakeSettingsProps) {
  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <Percent className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Rake Settings</CardTitle>
            <CardDescription>Applied only when a player wins</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rake Percentage</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={rake}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  if (!isNaN(val) && val >= 0 && val <= 100) {
                    onRakeChange(val)
                  }
                }}
                className="w-20 h-8 text-center text-sm bg-secondary border-border text-foreground"
                aria-label="Rake percentage input"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <Slider
            value={[rake]}
            onValueChange={(val) => onRakeChange(val[0])}
            min={0}
            max={30}
            step={0.5}
            className="w-full"
            aria-label="Rake percentage slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>15%</span>
            <span>30%</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-secondary/50 border border-border px-4 py-3">
          <span className="text-sm text-muted-foreground">Rake Collected</span>
          <span className="text-lg font-bold text-primary font-mono">
            {'₱'}{totalRakeCollected.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
