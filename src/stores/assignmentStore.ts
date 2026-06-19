import type { AssignmentSuggestion, AssignmentReview, AssignmentVersion, AssignmentPair, FinalRolePlan, PlayerProfile } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assignmentReviews } from '@/data/mockData'
import { generateAssignment } from '@/utils/assignmentEngine'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useScriptStore } from '@/stores/scriptStore'
import { usePlayerStore } from '@/stores/playerStore'

interface ReviewFilters {
  scheduleId?: string
  dmId?: string
  rating?: number
  startDate?: string
  endDate?: string
}

interface AssignmentState {
  suggestions: Record<string, AssignmentSuggestion>
  reviews: AssignmentReview[]
  generateSuggestion: (scheduleId: string) => AssignmentSuggestion
  getSuggestion: (scheduleId: string) => AssignmentSuggestion | undefined
  updateFinalPlan: (scheduleId: string, plan: FinalRolePlan[]) => void
  toggleLock: (scheduleId: string, playerId: string) => void
  swapRoles: (scheduleId: string, playerIdA: string, playerIdB: string) => void
  finalizeAssignment: (scheduleId: string) => void
  getReview: (scheduleId: string) => AssignmentReview | undefined
  saveReview: (review: AssignmentReview) => void
  getHistoricalReviews: (filters: ReviewFilters) => AssignmentReview[]
  createVersion: (scheduleId: string, type: AssignmentVersion['type'], description: string) => void
  switchToVersion: (scheduleId: string, versionId: string) => void
}

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set, get) => ({
  suggestions: {},
  reviews: assignmentReviews,
  generateSuggestion: (scheduleId) => {
    const schedule = useScheduleStore.getState().getScheduleById(scheduleId)
    const script = schedule ? useScriptStore.getState().getScriptById(schedule.scriptId) : undefined
    if (!schedule || !script) {
      throw new Error('Schedule or script not found')
    }
    const playerProfiles = schedule.players
      .map((sp) => usePlayerStore.getState().getPlayerById(sp.playerId))
      .filter(Boolean) as PlayerProfile[]
    const suggestion = generateAssignment(schedule, script, playerProfiles)
    const suggestionWithVersions = {
      ...suggestion,
      versions: [],
      currentVersionId: '',
    }
    set((state) => ({
      suggestions: {
        ...state.suggestions,
        [scheduleId]: suggestionWithVersions,
      },
    }))
    get().createVersion(scheduleId, 'auto_generate', '智能生成初始方案')
    return get().suggestions[scheduleId]
  },
  getSuggestion: (scheduleId) => {
    return get().suggestions[scheduleId]
  },
  updateFinalPlan: (scheduleId, plan) => {
    set((state) => {
      const current = state.suggestions[scheduleId]
      if (!current) return state
      const hasChanges = JSON.stringify(current.finalPlan) !== JSON.stringify(plan)
      const newSuggestion = {
        ...current,
        finalPlan: plan,
      }
      return {
        suggestions: {
          ...state.suggestions,
          [scheduleId]: newSuggestion,
        },
      }
    })
    const current = get().suggestions[scheduleId]
    if (current && current.versions.length > 0) {
      const lastVersion = current.versions[current.versions.length - 1]
      const hasChanges = JSON.stringify(lastVersion.plan) !== JSON.stringify(current.finalPlan)
      if (hasChanges) {
        get().createVersion(scheduleId, 'manual_adjust', '手动调整分配方案')
      }
    }
  },
  toggleLock: (scheduleId, playerId) => {
    set((state) => {
      const current = state.suggestions[scheduleId]
      if (!current) return state
      const newFinalPlan = current.finalPlan.map((item) =>
        item.playerId === playerId ? { ...item, isLocked: !item.isLocked } : item
      )
      return {
        suggestions: {
          ...state.suggestions,
          [scheduleId]: {
            ...current,
            finalPlan: newFinalPlan,
          },
        },
      }
    })
  },
  swapRoles: (scheduleId, playerIdA, playerIdB) => {
    set((state) => {
      const current = state.suggestions[scheduleId]
      if (!current) return state
      const idxA = current.finalPlan.findIndex((item) => item.playerId === playerIdA)
      const idxB = current.finalPlan.findIndex((item) => item.playerId === playerIdB)
      if (idxA === -1 || idxB === -1) return state
      const newFinalPlan = [...current.finalPlan]
      const roleIdA = newFinalPlan[idxA].roleId
      const roleIdB = newFinalPlan[idxB].roleId
      newFinalPlan[idxA] = { ...newFinalPlan[idxA], roleId: roleIdB }
      newFinalPlan[idxB] = { ...newFinalPlan[idxB], roleId: roleIdA }
      return {
        suggestions: {
          ...state.suggestions,
          [scheduleId]: {
            ...current,
            finalPlan: newFinalPlan,
          },
        },
      }
    })
    const current = get().suggestions[scheduleId]
    if (current && current.versions.length > 0) {
      const lastVersion = current.versions[current.versions.length - 1]
      const hasChanges = JSON.stringify(lastVersion.plan) !== JSON.stringify(current.finalPlan)
      if (hasChanges) {
        const playerA = usePlayerStore.getState().getPlayerById(playerIdA)
        const playerB = usePlayerStore.getState().getPlayerById(playerIdB)
        const desc = playerA && playerB ? `交换了${playerA.name}和${playerB.name}的角色` : '手动调整分配方案'
        get().createVersion(scheduleId, 'manual_adjust', desc)
      }
    }
  },
  finalizeAssignment: (scheduleId) => {
    const suggestion = get().suggestions[scheduleId]
    if (!suggestion) return
    const schedule = useScheduleStore.getState().getScheduleById(scheduleId)
    if (!schedule) return
    const updatedPlayers = schedule.players.map((player) => {
      const planItem = suggestion.finalPlan.find(
        (item) => item.playerId === player.playerId
      )
      return {
        ...player,
        finalRoleId: planItem?.roleId,
      }
    })
    useScheduleStore.getState().updateSchedule(scheduleId, { 
      players: updatedPlayers,
      status: 'playing' as const,
    })
  },
  getReview: (scheduleId) => {
    return get().reviews.find((review) => review.scheduleId === scheduleId)
  },
  saveReview: (review) => {
    set((state) => {
      const existingIdx = state.reviews.findIndex((r) => r.id === review.id)
      let newReviews
      if (existingIdx >= 0) {
        newReviews = [...state.reviews]
        newReviews[existingIdx] = review
      } else {
        newReviews = [...state.reviews, review]
      }
      return { reviews: newReviews }
    })
    // 同步更新车次状态为 finished
    useScheduleStore.getState().updateSchedule(review.scheduleId, { status: 'finished' as const })
  },
  getHistoricalReviews: (filters) => {
    return get().reviews.filter((review) => {
      if (filters.scheduleId && review.scheduleId !== filters.scheduleId) {
        return false
      }
      if (filters.dmId && review.dmId !== filters.dmId) {
        return false
      }
      if (filters.rating !== undefined && review.overallRating < filters.rating) {
        return false
      }
      if (filters.startDate && review.createdAt < filters.startDate) {
        return false
      }
      if (filters.endDate && review.createdAt > filters.endDate) {
        return false
      }
      return true
    })
  },
  createVersion: (scheduleId, type, description) => {
    const state = get()
    const current = state.suggestions[scheduleId]
    if (!current) return

    const schedule = useScheduleStore.getState().getScheduleById(scheduleId)
    const script = schedule ? useScriptStore.getState().getScriptById(schedule.scriptId) : undefined
    if (!schedule || !script) return

    const surveyCount = schedule.players.filter((sp) => sp.surveyResponse !== undefined).length

    const scores = current.finalPlan.map((pair) => {
      const row = current.matchMatrix.find((r) => r[0]?.playerId === pair.playerId)
      const cell = row?.find((c) => c.roleId === pair.roleId)
      return cell?.score || 0
    })
    const avgMatchScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    const versionNumber = current.versions.length + 1
    const versionId = `v_${scheduleId}_${versionNumber}_${Date.now()}`

    let diffFromPrev: AssignmentVersion['diffFromPrev'] | undefined = undefined
    if (current.versions.length > 0) {
      const prevVersion = current.versions[current.versions.length - 1]
      const changedDetails: string[] = []
      const playerStore = usePlayerStore.getState()
      const roleMap = new Map(script.roles.map((r) => [r.id, r.name]))

      prevVersion.plan.forEach((prevPair) => {
        const currPair = current.finalPlan.find((p) => p.playerId === prevPair.playerId)
        if (currPair && prevPair.roleId !== currPair.roleId) {
          const player = playerStore.getPlayerById(prevPair.playerId)
          const oldRole = roleMap.get(prevPair.roleId) || '?'
          const newRole = roleMap.get(currPair.roleId) || '?'
          const playerName = player?.name || '?'
          changedDetails.push(`${playerName}：${oldRole} → ${newRole}`)
        }
      })

      if (changedDetails.length > 0) {
        diffFromPrev = {
          changedPairs: changedDetails.length,
          changedDetails,
        }
      }
    }

    const newVersion: AssignmentVersion = {
      id: versionId,
      versionNumber,
      createdAt: new Date().toISOString(),
      type,
      description,
      surveyCount,
      plan: JSON.parse(JSON.stringify(current.finalPlan)),
      warningCount: current.warnings.length,
      avgMatchScore,
      diffFromPrev,
    }

    set((state) => {
      const cur = state.suggestions[scheduleId]
      if (!cur) return state
      return {
        suggestions: {
          ...state.suggestions,
          [scheduleId]: {
            ...cur,
            versions: [...cur.versions, newVersion],
            currentVersionId: versionId,
          },
        },
      }
    })
  },
  switchToVersion: (scheduleId, versionId) => {
    set((state) => {
      const current = state.suggestions[scheduleId]
      if (!current) return state
      const targetVersion = current.versions.find((v) => v.id === versionId)
      if (!targetVersion) return state
      return {
        suggestions: {
          ...state.suggestions,
          [scheduleId]: {
            ...current,
            finalPlan: JSON.parse(JSON.stringify(targetVersion.plan)),
            currentVersionId: versionId,
          },
        },
      }
    })
  },
}),
    {
      name: 'murder-mystery-assignments',
      partialize: (state) => ({ 
        suggestions: state.suggestions, 
        reviews: state.reviews 
      }),
    }
  )
)
