import type { AssignmentSuggestion, AssignmentReview, FinalRolePlan, PlayerProfile } from '@/types'
import { create } from 'zustand'
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
}

export const useAssignmentStore = create<AssignmentState>()((set, get) => ({
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
    set((state) => ({
      suggestions: {
        ...state.suggestions,
        [scheduleId]: suggestion,
      },
    }))
    return suggestion
  },
  getSuggestion: (scheduleId) => {
    return get().suggestions[scheduleId]
  },
  updateFinalPlan: (scheduleId, plan) => {
    set((state) => {
      const current = state.suggestions[scheduleId]
      if (!current) return state
      return {
        suggestions: {
          ...state.suggestions,
          [scheduleId]: {
            ...current,
            finalPlan: plan,
          },
        },
      }
    })
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
    useScheduleStore.getState().updateSchedule(scheduleId, { players: updatedPlayers })
  },
  getReview: (scheduleId) => {
    return get().reviews.find((review) => review.scheduleId === scheduleId)
  },
  saveReview: (review) => {
    set((state) => {
      const existingIdx = state.reviews.findIndex((r) => r.id === review.id)
      if (existingIdx >= 0) {
        const newReviews = [...state.reviews]
        newReviews[existingIdx] = review
        return { reviews: newReviews }
      }
      return { reviews: [...state.reviews, review] }
    })
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
}))
