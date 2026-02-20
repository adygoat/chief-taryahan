"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void
  existingNames: string[]
}

export function AddPlayerForm({ onAddPlayer, existingNames }: AddPlayerFormProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError("Please enter a player name")
      return
    }

    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError("Player already exists")
      return
    }

    onAddPlayer(trimmed)
    setName("")
    setError("")
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
            <UserPlus className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Add Player</CardTitle>
            <CardDescription>Enter a new player to the table</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Input
              placeholder="Player name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              aria-label="Player name"
              aria-invalid={!!error}
            />
            {error && (
              <span className="text-xs text-loss" role="alert">{error}</span>
            )}
          </div>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
