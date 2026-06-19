import type { DM } from '@/types'
import { create } from 'zustand'
import { dms } from '@/data/mockData'

interface DMState {
  dms: DM[]
  getDMById: (id: string) => DM | undefined
}

export const useDMStore = create<DMState>()((set, get) => ({
  dms: dms,
  getDMById: (id) => {
    return get().dms.find((dm) => dm.id === id)
  },
}))
