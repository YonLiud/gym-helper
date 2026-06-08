export interface User {
  username: string
}

export interface Gym {
  id: string
  user_id: string
  name: string
  location: string
  notes: string | null
  created_at: string
}

export interface Exercise {
  id: string
  user_id: string
  name: string
  muscle_group: string | null
  equipment_type: string | null
  created_at: string
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_id: string
  order: number
  weight: number | null
  reps: number | null
  notes: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  gym_id: string | null
  date: string
  notes: string | null
  created_at: string
  sets: WorkoutSet[]
}
