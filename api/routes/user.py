from fastapi import APIRouter
import bcrypt
from starlette.requests import Request
from fastapi.responses import JSONResponse
import random_object_id
from pprint import pprint

from config import db
from middlewares.auth import signJWT, validateRequest
from models.user import UserRegister, UserLogin, UserUpdate


router = APIRouter(prefix="/api/users")


@router.post("/register")
def registerUser(user: UserRegister):
    client = db.getMongoConn()
    database = client["WA"]

    usrInfo = database["users"].find_one({"email": user.email})

    if usrInfo is not None:
        client.close()
        return JSONResponse(status_code=400, content={"error": "El usuario ya existe"})
    else:
        hshpwd = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())
        usrData = {
            "_id": random_object_id.generate(),
            "name": user.name,
            "alias": user.alias,
            "password": hshpwd,
            "email": user.email,
            "friends": []
        }
        usrInserted = database["users"].insert_one(usrData).inserted_id
        client.close()

        return JSONResponse(status_code=201, content={"message": "Se ha creado el usuario", "_id": usrInserted})


@router.post("/login")
def loginUser(user: UserLogin):
    client = db.getMongoConn()
    database = client["WA"]

    usrInfo = database["users"].find_one({"email": user.email})

    if usrInfo is None:
        client.close()
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el usuario"})
    else:
        client.close()
        
        if not bcrypt.checkpw(user.password.encode(), usrInfo["password"]):
            return JSONResponse(status_code=400, content={"error": "Las credenciales son incorrectas"})
        else:
            token = signJWT(usrInfo["_id"], user.email)
            return JSONResponse(status_code=200, content={"message": "Se ha iniciado sesion correctamente", "token": token})


@router.get("/info")
def getUserInfo(request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]
    usrInfo = database["users"].find_one({"email": requestInfo["email"]})

    if usrInfo is not None:
        client.close()
        return JSONResponse(status_code=200, content={"name": usrInfo["name"], "alias": usrInfo["alias"], "email": usrInfo["email"], "friends": usrInfo["friends"]})
    else:
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el usuario"})


@router.patch("/update")
def updateUserInfo(userData: UserUpdate, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    updateOps = {}

    if userData.name:
        updateOps["name"] = userData.name
    if userData.alias:
        updateOps["alias"] = userData.alias
    if userData.friends:
        updateOps["friends"] = userData.friends

    usrUpdated = database["users"].find_one_and_update(
        {"_id": requestInfo["id"]}, update={"$set": updateOps})
    client.close()
    if usrUpdated is not None:
        client.close()
        return JSONResponse(status_code=200, content={"message": "Se ha actualizado correctamente la informacion"})
    else:
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el usuario"})
