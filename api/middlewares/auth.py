from os import getcwd
from typing import Dict
from starlette.requests import Request
import jwt
from dotenv import load_dotenv
import random

load_dotenv()


def signJWT(id: str, email: str, ) -> str:
    payload = {
        "rd": random.randint(0, 1000000),
        "id": id,
        "email": email,
        # "expires": time.time() + 600
    }

    # Abrir el archivo de la token privada

    f = open(f"{getcwd()}/keys/private.key", "r", encoding="utf8")

    token = jwt.encode(payload, f.read(), algorithm="RS256")

    return token


def signForJoin(id: str, email: str, deadline: str) -> str:
    payload = {
        "rd": random.randint(0, 1000000),
        "id": id,
        "email": email,
        "deadline": deadline
    }

    # Abrir el archivo de la token privada

    f = open(f"{getcwd()}/keys/private.key", "r", encoding="utf8")

    token = jwt.encode(payload, f.read(), algorithm="RS256")

    return token


def auth(token: str) -> Dict[str, str]:
    try:

        # Abrir el archivo de la token publica

        f = open(f"{getcwd()}/keys/public.pub", "r", encoding="utf8")

        decoded = jwt.decode(token, f.read(), algorithms="RS256")

        return {"status": 200, **decoded}

    except jwt.PyJWTError as error:
        print(error)
        return {"status": 401, "error": str(error)}


def validateRequest(request: Request):
    if not "Authorization" in request.headers:
        return {"status": 400, "error": "Encabezado no encontrado"}
    else:
        return auth(request.headers["Authorization"])
