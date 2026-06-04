workouts
- id UUID PK
- user_id UUID
- gym_id UUID  -- no FK, cross-service reference by convention
- date DATE
- notes TEXT
- created_at TIMESTAMP

sets
- id UUID PK
- workout_id UUID FK → workouts.id
- exercise_id UUID  -- no FK, cross-service reference
- order INT  -- position within the workout
- weight NUMERIC(6,2)
- reps INT
- notes TEXT
- created_at TIMESTAMP