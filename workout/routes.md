GET    /workouts            → list all (supports ?gym_id= filter)
POST   /workouts            → create
GET    /workouts/{id}       → get one
DELETE /workouts/{id}       → delete

POST   /workouts/{id}/sets      → add set to workout
PUT    /workouts/{id}/sets/{id} → update set
DELETE /workouts/{id}/sets/{id} → delete set