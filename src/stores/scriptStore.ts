import type { Script, Role } from '@/types'
import { create } from 'zustand'
import { scripts } from '@/data/mockData'

interface SearchScriptFilters {
  name?: string
  genre?: string
  playerCount?: number
  difficulty?: number | string
}

interface ScriptState {
  scripts: Script[]
  currentScriptId: string | null
  getScriptById: (id: string) => Script | undefined
  getRoleById: (scriptId: string, roleId: string) => Role | undefined
  setCurrentScript: (id: string | null) => void
  updateRole: (scriptId: string, roleId: string, updates: Partial<Role>) => void
  addRole: (scriptId: string, role: Role) => void
  removeRole: (scriptId: string, roleId: string) => void
  searchScripts: (filters: SearchScriptFilters) => Script[]
}

export const useScriptStore = create<ScriptState>()((set, get) => ({
  scripts: scripts,
  currentScriptId: null,
  getScriptById: (id) => {
    return get().scripts.find((script) => script.id === id)
  },
  getRoleById: (scriptId, roleId) => {
    const script = get().getScriptById(scriptId)
    return script?.roles.find((role) => role.id === roleId)
  },
  setCurrentScript: (id) => {
    set({ currentScriptId: id })
  },
  updateRole: (scriptId, roleId, updates) => {
    set((state) => ({
      scripts: state.scripts.map((script) =>
        script.id === scriptId
          ? {
              ...script,
              roles: script.roles.map((role) =>
                role.id === roleId ? { ...role, ...updates } : role
              ),
            }
          : script
      ),
    }))
  },
  addRole: (scriptId, role) => {
    set((state) => ({
      scripts: state.scripts.map((script) =>
        script.id === scriptId
          ? { ...script, roles: [...script.roles, role] }
          : script
      ),
    }))
  },
  removeRole: (scriptId, roleId) => {
    set((state) => ({
      scripts: state.scripts.map((script) =>
        script.id === scriptId
          ? { ...script, roles: script.roles.filter((role) => role.id !== roleId) }
          : script
      ),
    }))
  },
  searchScripts: (filters) => {
    return get().scripts.filter((script) => {
      if (filters.name && !script.name.toLowerCase().includes(filters.name.toLowerCase().trim())) {
        return false
      }
      if (filters.genre && !script.genre.includes(filters.genre)) {
        return false
      }
      if (filters.playerCount !== undefined) {
        if (
          filters.playerCount < script.minPlayers ||
          filters.playerCount > script.maxPlayers
        ) {
          return false
        }
      }
      if (filters.difficulty !== undefined && String(script.difficulty) !== String(filters.difficulty)) {
        return false
      }
      return true
    })
  },
}))
