import { useMemo } from 'react'
import type { Exercise, Workout } from '../types'
import { useExercises } from './useExercises'
import { useWorkouts } from './useWorkouts'

export interface PR {
  exerciseId: string
  exerciseName: string
  muscleGroup: string | null
  weight: number
  reps: number | null
}

export interface MuscleGroupStat {
  name: string
  count: number
  daysSinceLastTrained: number
}

export interface WorkoutStats {
  thisWeek: number
  streak: number
  volumeThisWeek: number
  daysSinceLastWorkout: number | null
  topMuscleGroup: string | null
  muscleGroups: MuscleGroupStat[]
  prs: PR[]
  loading: boolean
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d
}

function computeStats(workouts: Workout[], exercises: Exercise[]): Omit<WorkoutStats, 'loading'> {
  const exerciseMap = new Map<string, Exercise>(exercises.map(e => [e.id, e]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = startOfWeek(today)

  // Workouts this week
  const thisWeek = workouts.filter(w => new Date(w.date + 'T00:00:00') >= weekStart).length

  // Weekly streak (consecutive weeks with >= 1 workout, back from current)
  let streak = 0
  let checkStart = new Date(weekStart)
  while (true) {
    const checkEnd = new Date(checkStart)
    checkEnd.setDate(checkEnd.getDate() + 7)
    const hit = workouts.some(w => {
      const d = new Date(w.date + 'T00:00:00')
      return d >= checkStart && d < checkEnd
    })
    if (!hit) break
    streak++
    checkStart.setDate(checkStart.getDate() - 7)
  }

  // Volume this week (kg)
  const volumeThisWeek = workouts
    .filter(w => new Date(w.date + 'T00:00:00') >= weekStart)
    .flatMap(w => w.sets)
    .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0)

  // Days since last workout
  const lastDate = workouts
    .map(w => new Date(w.date + 'T00:00:00'))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
  const daysSinceLastWorkout = lastDate
    ? Math.round((today.getTime() - lastDate.getTime()) / 86_400_000)
    : null

  // Muscle group breakdown — count + last trained date
  const mgCounts = new Map<string, number>()
  const mgLastDate = new Map<string, number>() // ms timestamp of most recent workout
  workouts.forEach(w => {
    const ts = new Date(w.date + 'T00:00:00').getTime()
    w.sets.forEach(s => {
      const mg = exerciseMap.get(s.exercise_id)?.muscle_group
      if (!mg) return
      mgCounts.set(mg, (mgCounts.get(mg) ?? 0) + 1)
      if (!mgLastDate.has(mg) || ts > mgLastDate.get(mg)!) mgLastDate.set(mg, ts)
    })
  })
  const muscleGroups: MuscleGroupStat[] = [...mgCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      daysSinceLastTrained: Math.round((today.getTime() - (mgLastDate.get(name) ?? 0)) / 86_400_000),
    }))
  const topMuscleGroup = muscleGroups[0]?.name ?? null

  // PRs — best weighted set per exercise, sorted by most recently logged
  const bestByExercise = new Map<string, { weight: number; reps: number | null; date: string }>()
  workouts
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(w => {
      w.sets.forEach(s => {
        if (s.weight === null) return
        const cur = bestByExercise.get(s.exercise_id)
        if (!cur || s.weight > cur.weight)
          bestByExercise.set(s.exercise_id, { weight: s.weight, reps: s.reps, date: w.date })
      })
    })
  const prs: PR[] = [...bestByExercise.entries()]
    .sort((a, b) => b[1].date.localeCompare(a[1].date))
    .slice(0, 5)
    .map(([exerciseId, best]) => {
      const ex = exerciseMap.get(exerciseId)
      return {
        exerciseId,
        exerciseName: ex?.name ?? 'Unknown',
        muscleGroup: ex?.muscle_group ?? null,
        weight: best.weight,
        reps: best.reps,
      }
    })

  return { thisWeek, streak, volumeThisWeek, daysSinceLastWorkout, topMuscleGroup, muscleGroups, prs }
}

const EMPTY: Omit<WorkoutStats, 'loading'> = {
  thisWeek: 0, streak: 0, volumeThisWeek: 0,
  daysSinceLastWorkout: null, topMuscleGroup: null, muscleGroups: [], prs: [],
}

export function useWorkoutStats(): WorkoutStats {
  const { workouts, loading: lw } = useWorkouts()
  const { exercises, loading: le } = useExercises()
  const loading = lw || le

  const stats = useMemo(
    () => (loading ? EMPTY : computeStats(workouts, exercises)),
    [workouts, exercises, loading],
  )

  return { ...stats, loading }
}
