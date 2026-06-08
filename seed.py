#!/usr/bin/env python3
"""Seed script — run once to populate demo data for development."""

import json
import urllib.request
import urllib.error
from datetime import date, timedelta
from pathlib import Path

BASE = "http://localhost:8000"


def load_env():
    env_file = Path(__file__).parent / ".env"
    env = {}
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    return env


def req(method, path, body=None, cookie=None, headers_extra=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if cookie:
        headers["Cookie"] = cookie
    if headers_extra:
        headers.update(headers_extra)
    r = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as res:
            raw = res.read()
            set_cookie = res.headers.get("Set-Cookie")
            return json.loads(raw) if raw else None, set_cookie
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERR {method} {path} -> {e.code}: {body}")
        raise


def main():
    env = load_env()
    register_key = env.get("REGISTER_KEY")
    if not register_key:
        print("ERR REGISTER_KEY not found in .env")
        return

    username = "yon"
    password = "password"

    print("\n-> Registering user…")
    try:
        _, set_cookie = req(
            "POST", "/auth/register",
            {"username": username, "password": password},
            headers_extra={"X-Register-Key": register_key},
        )
        print(f"  ok Registered {username}")
    except urllib.error.HTTPError as e:
        if e.code == 409:
            print(f"  · User already exists, logging in…")
            _, set_cookie = req("POST", "/auth/login", {"username": username, "password": password})
        else:
            raise

    cookie = set_cookie.split(";")[0]
    print(f"  ok Authenticated as {username}")

    print("\n-> Creating gym…")
    gym, _ = req("POST", "/gym", {
        "name": "Iron & Steel Gym",
        "location": "Downtown",
        "notes": "Main training spot",
    }, cookie)
    print(f"  ok {gym['name']} ({gym['id']})")

    print("\n-> Creating exercises…")
    exercise_defs = [
        ("Bench Press",     "chest",     "barbell"),
        ("Squat",           "legs",      "barbell"),
        ("Deadlift",        "back",      "barbell"),
        ("Overhead Press",  "shoulders", "barbell"),
        ("Barbell Row",     "back",      "barbell"),
        ("Pull-up",         "back",      "bodyweight"),
        ("Dumbbell Curl",   "biceps",    "dumbbell"),
        ("Tricep Pushdown", "triceps",   "cable"),
    ]
    exercises = {}
    for name, muscle, equipment in exercise_defs:
        ex, _ = req("POST", "/exercise", {
            "name": name,
            "muscle_group": muscle,
            "equipment_type": equipment,
        }, cookie)
        exercises[name] = ex["id"]
        print(f"  ok {name}")

    print("\n-> Creating workouts…")
    today = date.today()

    workouts = [
        {
            "date": str(today - timedelta(days=6)),
            "gym_id": gym["id"],
            "notes": "Push day — felt strong",
            "sets": [
                ("Bench Press",    4, 80,  8),
                ("Overhead Press", 3, 50,  10),
                ("Tricep Pushdown",3, 25,  12),
            ],
        },
        {
            "date": str(today - timedelta(days=4)),
            "gym_id": gym["id"],
            "notes": "Pull day",
            "sets": [
                ("Pull-up",      4, None, 8),
                ("Barbell Row",  4, 70,   8),
                ("Dumbbell Curl",3, 15,   12),
            ],
        },
        {
            "date": str(today - timedelta(days=2)),
            "gym_id": gym["id"],
            "notes": "Leg day — new squat PR",
            "sets": [
                ("Squat",    5, 100, 5),
                ("Deadlift", 3, 120, 5),
            ],
        },
    ]

    for w in workouts:
        workout, _ = req("POST", "/workout", {
            "date": w["date"],
            "gym_id": w["gym_id"],
            "notes": w["notes"],
        }, cookie)

        for i, (name, sets, weight, reps) in enumerate(w["sets"]):
            for s in range(sets):
                req("POST", f"/workout/{workout['id']}/sets", {
                    "exercise_id": exercises[name],
                    "order": i * 10 + s,
                    "weight": weight,
                    "reps": reps,
                }, cookie)

        print(f"  ok {w['date']}  {w['notes']}")

    print("\nok Done — 1 gym, 8 exercises, 3 workouts seeded.")


if __name__ == "__main__":
    main()
