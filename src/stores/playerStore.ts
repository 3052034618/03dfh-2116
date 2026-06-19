import type { PlayerProfile } from '@/types'
import { create } from 'zustand'
import { players } from '@/data/mockData'

interface PlayerState {
  players: PlayerProfile[]
  selectedPlayerId: string | null
  getPlayerById: (id: string) => PlayerProfile | undefined
  setSelectedPlayer: (id: string | null) => void
  searchPlayers: (query: string) => PlayerProfile[]
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  players: players,
  selectedPlayerId: null,
  getPlayerById: (id) => {
    return get().players.find((player) => player.id === id)
  },
  setSelectedPlayer: (id) => {
    set({ selectedPlayerId: id })
  },
  searchPlayers: (query) => {
    const lowerQuery = query.toLowerCase().trim()
    if (!lowerQuery) return get().players
    return get().players.filter((player) => {
      return (
        player.name.toLowerCase().includes(lowerQuery) ||
        (player.nickname && player.nickname.toLowerCase().includes(lowerQuery)) ||
        (player.phone && player.phone.includes(lowerQuery))
      )
    })
  },
}))
