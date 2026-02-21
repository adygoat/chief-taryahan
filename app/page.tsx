"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CasinoHeader } from "@/components/casino/header"
import { RakeSettings } from "@/components/casino/rake-settings"
import { AddPlayerForm } from "@/components/casino/add-player-form"
import { PlayerTable, type Player } from "@/components/casino/player-table"
import { StatsBar } from "@/components/casino/stats-bar"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

type Session = {
  id: string
  name: string
  createdAt: string
}

function getOrCreateUserId() {
  const key = "casino_user_id"
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function CasinoPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState("")
  const [sessionName, setSessionName] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [rake, setRake] = useState(5)

  // ✅ userId per browser (host has their own; viewers have their own)
  const [userId] = useState(() => {
    if (typeof window === "undefined") return ""
    return getOrCreateUserId()
  })

  // ✅ headers helpers
  const userHeader = useMemo(() => ({ "x-user-id": userId }), [userId])
  const userJsonHeader = useMemo(
    () => ({ "x-user-id": userId, "Content-Type": "application/json" }),
    [userId]
  )

  // Load sessions list on mount
  useEffect(() => {
    if (!userId) return

    ;(async () => {
      const res = await fetch("/api/sessions", {
        cache: "no-store",
        headers: userHeader,
      })
      const data = (await res.json()) as Session[]
      setSessions(Array.isArray(data) ? data : [])

      // restore last selected session (per browser)
      const saved = localStorage.getItem("casino_session_id")
      if (saved) setSessionId(saved)
    })()
  }, [userId, userHeader])

  // Load selected session data
  useEffect(() => {
    if (!userId) return

    if (!sessionId) {
      setPlayers([])
      return
    }

    localStorage.setItem("casino_session_id", sessionId)

    ;(async () => {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        cache: "no-store",
        headers: userHeader,
      })
      const data = await res.json()

      const mapped: Player[] = (data.players ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        wager: 0,
        winnings: 0,
        net: Number(p.net) || 0,
        totalRakeCollected: Number(p.totalRakeCollected) || 0,
        totalWager: Number(p.totalWager) || 0,
        totalWinnings: Number(p.totalWinnings) || 0,
        carryLoss: Number(p.carryLoss) || 0,
      }))

      setPlayers(mapped)
    })()
  }, [sessionId, userId, userHeader])

  const createSession = useCallback(async () => {
    const name = sessionName.trim()
    if (!name) return
    if (!userId) return

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: userJsonHeader,
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err?.error ?? "Failed to create session")
      return
    }

    const created = (await res.json()) as Session
    setSessions((prev) => [created, ...prev])
    setSessionName("")
    setSessionId(created.id)
  }, [sessionName, userId, userJsonHeader])

  const deleteSession = useCallback(async () => {
    if (!sessionId) return
    if (!userId) return

    const ok = confirm("Delete this session? This will remove all players and totals for it.")
    if (!ok) return

    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: userHeader,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err?.error ?? "Failed to delete session")
      return
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    setSessionId("")
    setPlayers([])
    localStorage.removeItem("casino_session_id")
  }, [sessionId, userId, userHeader])

  const addPlayer = useCallback(
    async (name: string) => {
      if (!sessionId) {
        alert("Select or create a session first.")
        return
      }
      if (!userId) return

      const res = await fetch(`/api/sessions/${sessionId}/players`, {
        method: "POST",
        headers: userJsonHeader,
        body: JSON.stringify({ playerName: name }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err?.error ?? "Failed to add player")
        return
      }

      const p = await res.json()

      const newPlayer: Player = {
        id: p.id, // session_players.id
        name: p.name,
        wager: 0,
        winnings: 0,
        net: Number(p.net) || 0,
        totalRakeCollected: Number(p.totalRakeCollected) || 0,
        totalWager: Number(p.totalWager) || 0,
        totalWinnings: Number(p.totalWinnings) || 0,
        carryLoss: Number(p.carryLoss) || 0,
      }

      setPlayers((prev) => {
        if (prev.some((x) => x.id === newPlayer.id)) return prev
        return [...prev, newPlayer]
      })
    },
    [sessionId, userId, userJsonHeader]
  )

  const submitRound = useCallback(
    async (id: string, wager: number, winnings: number) => {
      if (!userId) return

      const res = await fetch(`/api/sessionplayers/${id}/round`, {
        method: "POST",
        headers: userJsonHeader,
        body: JSON.stringify({ wager, winnings, rakePercent: rake }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err?.error ?? "Failed to submit round")
        return
      }

      const updated = await res.json()

      setPlayers((prev) =>
        prev.map((p) =>
          p.id !== id
            ? p
            : {
                ...p,
                wager: 0,
                winnings: 0,
                net: Number(updated.net ?? p.net),
                totalRakeCollected: Number(updated.totalRakeCollected ?? p.totalRakeCollected),
                totalWager: Number(updated.totalWager ?? p.totalWager),
                totalWinnings: Number(updated.totalWinnings ?? p.totalWinnings),
                carryLoss: Number(updated.carryLoss ?? p.carryLoss),
              }
        )
      )
    },
    [rake, userId, userJsonHeader]
  )

  const removePlayer = useCallback(
    async (id: string) => {
      if (!userId) return

      const ok = confirm("Remove this player from the session?")
      if (!ok) return

      const res = await fetch(`/api/sessionplayers/${id}`, {
        method: "DELETE",
        headers: userHeader,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err?.error ?? "Failed to remove player")
        return
      }

      setPlayers((prev) => prev.filter((p) => p.id !== id))
    },
    [userId, userHeader]
  )

  const resetLocalOnly = useCallback(() => {
    setPlayers([])
    setRake(5)
  }, [])

  const totalRakeCollected = useMemo(
    () => players.reduce((sum, p) => sum + (p.totalRakeCollected || 0), 0),
    [players]
  )
  const grandTotalWager = useMemo(
    () => players.reduce((sum, p) => sum + (p.totalWager || 0), 0),
    [players]
  )
  const grandTotalWinnings = useMemo(
    () => players.reduce((sum, p) => sum + (p.totalWinnings || 0), 0),
    [players]
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 pb-12">
        <CasinoHeader />

        {/* Session Controls */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Session</span>
              <select
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              >
                <option value="">Select a session…</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={deleteSession}
                disabled={!sessionId}
                className="border-border text-muted-foreground hover:text-loss hover:border-loss/30 hover:bg-loss/5"
              >
                Delete Session
              </Button>
            </div>

            <div className="flex gap-2">
              <input
                className="h-9 w-full md:w-64 rounded-md border border-border bg-background px-3 text-sm"
                placeholder="New session name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createSession()
                }}
              />
              <Button onClick={createSession} disabled={!sessionName.trim()}>
                Create
              </Button>
            </div>
          </div>

          {!sessionId && (
            <p className="text-xs text-muted-foreground">Gawa ka session chief!</p>
          )}
        </div>

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
                onClick={resetLocalOnly}
                className="border-border text-muted-foreground hover:text-loss hover:border-loss/30 hover:bg-loss/5"
              >
                <RotateCcw className="size-4" />
                Reset (Local)
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">kick.com/armeldoto &middot; Use code CHIEF</p>
        </footer>
      </div>
    </main>
  )
}