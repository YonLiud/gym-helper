import os

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from jose import JWTError, jwt

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

UPSTREAM = {
    "auth":     os.environ["AUTH_URL"],
    "exercise": os.environ["EXERCISE_URL"],
    "gym":      os.environ["GYM_URL"],
    "workout":  os.environ["WORKOUT_URL"],
}

_HOP_BY_HOP = {"host", "content-length", "transfer-encoding", "connection"}

_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.1.119:5173",
]
if _domain := os.environ.get("FRONTEND_DOMAIN"):
    _ORIGINS.append(_domain)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(request: Request) -> dict:
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"user_id": payload["sub"], "username": payload["username"]}
    except (JWTError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid token")


async def _proxy(path: str, request: Request, extra_headers: dict = {}) -> Response:
    service = path.split("/")[0]
    upstream = UPSTREAM.get(service)
    if upstream is None:
        raise HTTPException(status_code=404, detail="Not found")

    # Strip the service-name prefix — each service handles its own routes without it
    sub_path = path[len(service):]

    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_BY_HOP}
    headers.update(extra_headers)

    async with httpx.AsyncClient() as client:
        resp = await client.request(
            method=request.method,
            url=f"{upstream}{sub_path}",
            headers=headers,
            content=await request.body(),
            params=request.query_params,
        )

    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers={k: v for k, v in resp.headers.items() if k.lower() not in _HOP_BY_HOP},
        media_type=resp.headers.get("content-type"),
    )


@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def public_routes(path: str, request: Request):
    return await _proxy(f"auth/{path}", request)


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def protected_routes(path: str, request: Request, user: dict = Depends(get_current_user)):
    return await _proxy(path, request, {"X-User-Id": user["user_id"], "X-Username": user["username"]})
