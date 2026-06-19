import type { Schedule, SchedulePlayer, SurveyStatus } from '@/types'
import { create } from 'zustand'
import { schedules } from '@/data/mockData'
import { format, isSameDay, isWithinInterval, parseISO } from 'date-fns'

interface CreateScheduleData {
  scriptId: string
  dmId: string
  date: string
  startTime: string
  endTime: string
  room?: string
  notes?: string
}

interface ScheduleState {
  schedules: Schedule[]
  currentScheduleId: string | null
  getScheduleById: (id: string) => Schedule | undefined
  setCurrentSchedule: (id: string | null) => void
  createSchedule: (data: CreateScheduleData) => Schedule
  updateSchedule: (id: string, updates: Partial<Schedule>) => void
  deleteSchedule: (id: string) => void
  addPlayerToSchedule: (scheduleId: string, playerData: SchedulePlayer) => void
  removePlayerFromSchedule: (scheduleId: string, playerId: string) => void
  sendSurvey: (scheduleId: string) => void
  updatePlayerSurvey: (scheduleId: string, playerId: string, survey: any) => void
  getSchedulesByDate: (dateStr: string) => Schedule[]
  getSchedulesByDateRange: (start: string, end: string) => Schedule[]
  getTodaySchedules: () => Schedule[]
}

const generateId = () => {
  return 'sch_' + Math.random().toString(36).substring(2, 9)
}

export const useScheduleStore = create<ScheduleState>()((set, get) => ({
  schedules: schedules,
  currentScheduleId: null,
  getScheduleById: (id) => {
    return get().schedules.find((schedule) => schedule.id === id)
  },
  setCurrentSchedule: (id) => {
    set({ currentScheduleId: id })
  },
  createSchedule: (data) => {
    const newSchedule: Schedule = {
      id: generateId(),
      scriptId: data.scriptId,
      dmId: data.dmId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || '未安排',
      players: [],
      status: 'pending',
      surveyStatus: 'not_sent',
      createdAt: new Date().toISOString(),
    }
    if (data.notes) {
      ;(newSchedule as any).notes = data.notes
    }
    set((state) => ({
      schedules: [...state.schedules, newSchedule],
    }))
    return newSchedule
  },
  updateSchedule: (id, updates) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    }))
  },
  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter((schedule) => schedule.id !== id),
    }))
  },
  addPlayerToSchedule: (scheduleId, playerData) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, players: [...schedule.players, playerData] }
          : schedule
      ),
    }))
  },
  removePlayerFromSchedule: (scheduleId, playerId) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              players: schedule.players.filter((p) => p.playerId !== playerId),
            }
          : schedule
      ),
    }))
  },
  sendSurvey: (scheduleId) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, surveyStatus: 'sent' as SurveyStatus }
          : schedule
      ),
    }))
  },
  updatePlayerSurvey: (scheduleId, playerId, survey) => {
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              players: schedule.players.map((p) =>
                p.playerId === playerId ? { ...p, surveyResponse: survey } : p
              ),
            }
          : schedule
      ),
    }))
  },
  getSchedulesByDate: (dateStr) => {
    const targetDate = parseISO(dateStr)
    return get().schedules.filter((schedule) =>
      isSameDay(parseISO(schedule.date), targetDate)
    )
  },
  getSchedulesByDateRange: (start, end) => {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    return get().schedules.filter((schedule) => {
      const scheduleDate = parseISO(schedule.date)
      return isWithinInterval(scheduleDate, { start: startDate, end: endDate })
    })
  },
  getTodaySchedules: () => {
    return get().getSchedulesByDate('2026-06-20')
  },
}))
