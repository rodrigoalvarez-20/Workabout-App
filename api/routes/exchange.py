from datetime import datetime
from fastapi import APIRouter
from fastapi import APIRouter
from starlette.requests import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import random_object_id
import random
from pprint import pprint
import string
import datetime

from config import db
from middlewares.auth import validateRequest, signForJoin
from models.exchange import NewExchange, UpdateExchange, UpdateExchangePref
from utils.mail import send_confirm_email, send_notification_email


router = APIRouter(prefix="/api/exchanges")


@router.post("/right-now/{id}")
def makeExchangeRightNow(id: str, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    exInfo = database["exchanges"].find_one({"_id": id})

    if exInfo["organizer"] != requestInfo["id"]:
        return JSONResponse(status_code=401, content={"error": "Usted no tiene los permisos necesarios para realizar la accion"})

    if len(exInfo["participants"]) % 2 == 1:
        return JSONResponse(status_code=400, content={"error": "No hay los suficientes participantes"})

    if "enabled" in exInfo and exInfo["enabled"] == False:
        return JSONResponse(status_code=400, content={"error": "Ya no se puede realizar el sorteo del evento"})

    participants = exInfo["participants"]

    indexes = list(range(0, len(participants)))

    random.shuffle(indexes)

    participantsDraw = [participants[x] for x in indexes]

    return JSONResponse(status_code=200, content={"resultados": participantsDraw})


class ParticipantsDrawList(BaseModel):
    participants: list


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


@router.post("/finish/{id}")
def finishEvent(id: str, participants: ParticipantsDrawList, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    exInfo = database["exchanges"].find_one({"_id": id})

    if exInfo["organizer"] != requestInfo["id"]:
        return JSONResponse(status_code=401, content={"error": "Usted no tiene los permisos necesarios para realizar la accion"})

    intPersons = chunks(participants.participants, 2)

    for x in intPersons:
        p1 = x[0]
        p2 = x[1]
        today = datetime.date.today().strftime("%d/%m/%Y")
        database["users"].find_one_and_update({"email": p1["email"]}, {"$push": {
            "events": {
                "name": exInfo["name"],
                "code": exInfo["code"],
                "date": today,
                "friend": p2["name"],
                "friend_email": p2["email"],
                "topic": p2["pref"]}}})

        database["users"].find_one_and_update({"email": p2["email"]}, {"$push": {
            "events": {
                "name": exInfo["name"],
                "code": exInfo["code"],
                "date": today,
                "friend": p1["name"],
                "friend_email": p1["email"],
                "topic": p1["pref"]}}})

        send_notification_email(p1["email"], p1["name"], p2["name"],
                                p2["pref"] if "pref" in p2 else "", exInfo["name"])
        send_notification_email(p2["email"], p2["name"], p1["name"],
                                p1["pref"] if "pref" in p1 else "", exInfo["name"])

    update = database["exchanges"].find_one_and_update(
        {"_id": id}, {"$set": {"enabled": False}})

    if update is None:
        return JSONResponse(status_code=404, content={"error": "No se ha podido finalizar el evento"})

    return JSONResponse(status_code=200, content={"message": "Se han eviado los correos de notificacion y se ha finalizado el evento correctamente"})


@router.get("/list")
def getUserExchanges(request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    usr_id = requestInfo["id"]

    exchanges = list(database["exchanges"].find({"organizer": usr_id}))

    client.close()

    return JSONResponse(status_code=200, content={"exchanges": exchanges})


@router.get("/accepted")
def getUserInvitedExchanges(request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    exchanges = list(database["exchanges"].find(
        {"participants.email": requestInfo["email"]}))

    client.close()

    return JSONResponse(status_code=200, content={"exchanges": exchanges})


@router.get("/pending")
def getUserInvitedExchanges(request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    exchanges = list(database["exchanges"].find(
        {"requested.email": requestInfo["email"]}))

    client.close()

    return JSONResponse(status_code=200, content={"exchanges": exchanges})


@router.post("/decline/{id}")
def declineInvitation(id: str, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    usrInfo = database["users"].find_one({"email": requestInfo["email"]})

    database["exchanges"].update_one({"_id": id}, {
                                     "$pull": {"requested": {"name": usrInfo["name"], "email": usrInfo["email"]}}})

    return JSONResponse(status_code=200, content={"message": "Se ha declinado la invitacion"})


@router.post("/exit/{id}")
def exitFromEvent(id: str, request: Request):
    requestInfo = validateRequest(request)
    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    usrInfo = database["users"].find_one({"email": requestInfo["email"]})

    database["exchanges"].update_one({"_id": id}, {
                                     "$pull": {"participants": {"name": usrInfo["name"], "email": requestInfo["email"]}}})

    return JSONResponse(status_code=200, content={"message": "Se ha eliminado la participacion en el evento"})


@router.post("/create")
def createExchange(request: Request, exInfo: NewExchange):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    usr_id = requestInfo["id"]

    usrInfo = database["users"].find_one({"_id": usr_id})

    code = ""

    if exInfo.code is None:
        letters = string.ascii_letters
        numbers = string.digits
        code = ''.join(random.choice(letters)
                       for _ in range(3)).join(random.choice(numbers) for _ in range(3))
    else:
        code = exInfo.code

    usersToSendInvitation = []
    usersNotRegistered = []

    for p in exInfo.requested:
        usr = database["users"].find_one({"email": p["email"]})

        usersToSendInvitation.append(
            p) if usr is not None else usersNotRegistered.append(p)

    newExchange = {
        "_id": random_object_id.generate(),
        "code": code,
        "organizer": usr_id,
        "name": exInfo.name,
        "topics": exInfo.topics,
        "max_amount": int(exInfo.max_amount),
        "participants": [{"name": usrInfo["name"], "email": usrInfo["email"]}],
        "deadline": exInfo.deadline,
        "exchange_date": exInfo.exchange_date,
        "requested": usersToSendInvitation,
        "comments": exInfo.comments
    }

    # TODO Crear algo chido para que al momento de llegar al Exchange_Date se haga el trigger

    for participant in usersToSendInvitation:
        # Crear la token de sesion falsa para que acepte la invitacion
        token = signForJoin(newExchange["_id"],
                            participant["email"], exInfo.deadline)
        link = f"http://127.0.0.1:3000/email/accept-invitation?tk={token}"
        send_confirm_email(
            to=participant["email"], link=link, name=participant["name"], user=usrInfo["name"], date=exInfo.exchange_date, subject=exInfo.name, deadline=exInfo.deadline)

    database["exchanges"].insert_one(newExchange)

    client.close()

    return JSONResponse(status_code=200, content={"message": "Se ha creado correctamente y se han enviado las invitaciones", "requested": usersToSendInvitation, "not_users": usersNotRegistered})


@router.post("/accept-event/{id}")
def acceptInvitationToEvent(id: str, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    idExchange = id
    usrEmail = requestInfo["email"]

    exInfo = database["exchanges"].find_one({"_id": idExchange})

    if exInfo is None:
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el evento especificado"})

    deadline = exInfo["deadline"]

    if deadline:
        day, month, year = deadline.split("/")
        deadlineExchange = datetime.datetime(int(year), int(month), int(day))
        today = datetime.date.today()
        d, m, y = today.strftime("%d/%m/%Y").split("/")
        actualDate = datetime.datetime(int(y), int(m), int(d))
        if actualDate > deadlineExchange:
            return JSONResponse(status_code=401, content={"error": "La invitacion ha expirado"})

    usrInfo = database["users"].find_one({"email": usrEmail})

    if usrInfo is None:
        return JSONResponse(status_code=500, content={"error": "Ha ocurrido un error al aceptar la invitacion, intente de nuevo mas tarde"})

    participants = exInfo["participants"]
    emails = [p["email"] for p in participants]
    if usrEmail in emails:
        return JSONResponse(status_code=200, content={"message": "Usted ya ha aceptado la invitacion"})

    database["exchanges"].update_one({"_id": idExchange}, {
                                     "$push": {"participants": {"name": usrInfo["name"], "email": usrEmail}}, "$pull": {"requested": {"name": usrInfo["name"], "email": usrEmail}}})
    client.close()

    return JSONResponse(status_code=200, content={"message": "Se ha aceptado la invitacion correctamente"})


@router.get("/accept")
def acceptInvitation(request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    idExchange = requestInfo["id"]
    usrEmail = requestInfo["email"]
    deadline = requestInfo["deadline"]

    if deadline:
        day, month, year = deadline.split("/")
        deadlineExchange = datetime.datetime(int(year), int(month), int(day))
        today = datetime.date.today()
        d, m, y = today.strftime("%d/%m/%Y").split("/")
        actualDate = datetime.datetime(int(y), int(m), int(d))
        if actualDate > deadlineExchange:
            return JSONResponse(status_code=401, content={"error": "El enlace de invitacion ha expirado"})

    client = db.getMongoConn()
    database = client["WA"]

    usrInfo = database["users"].find_one({"email": usrEmail})

    if usrInfo is None:
        return JSONResponse(status_code=500, content={"error": "Ha ocurrido un error al aceptar la invitacion, intente de nuevo mas tarde"})

    exInfo = database["exchanges"].find_one({"_id": idExchange})

    if exInfo is None:
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el evento especificado"})

    participants = exInfo["participants"]
    emails = [p["email"] for p in participants]
    if usrEmail in emails:
        return JSONResponse(status_code=200, content={"message": "Usted ya ha aceptado la invitacion"})

    database["exchanges"].update_one({"_id": idExchange}, {
                                     "$push": {"participants": {"name": usrInfo["name"], "email": usrEmail}}, "$pull": {"requested": {"name": usrInfo["name"], "email": usrEmail}}})
    client.close()

    return JSONResponse(status_code=200, content={"message": "Se ha aceptado la invitacion correctamente"})


@router.post("/decline-invitation")
def declineInvitation(request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    idExchange = requestInfo["id"]
    usrEmail = requestInfo["email"]

    database["exchanges"].update_one({"_id": idExchange}, {
                                     "$pull": {"requested": {"email": usrEmail}}})

    return JSONResponse(status_code=200, content={"message": "Se ha declinado la invitacion"})


@router.patch("/update")
def updateEvent(exchange: UpdateExchange, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    updateOps = {}
    client = db.getMongoConn()
    database = client["WA"]

    exData = database["exchanges"].find_one({"_id": exchange.id})
    usrInfo = database["users"].find_one({"_id": requestInfo["id"]})

    if exData is None:
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el evento solicitado"})

    if exData["organizer"] != requestInfo["id"]:
        return JSONResponse(status_code=401, content={"error": "Usted no tiene los permisos necesarios para modificar el evento"})

    if exchange.code and exchange.code.strip():
        updateOps["code"] = exchange.code.strip()
    if exchange.name and exchange.name.strip():
        updateOps["name"] = exchange.name.strip()
    if len(exchange.topics) > 0:
        updateOps["topics"] = exchange.topics
    if exchange.max_amount != 0:
        updateOps["max_amount"] = exchange.max_amount
    if exchange.deadline and exchange.deadline.strip():
        updateOps["deadline"] = exchange.deadline.strip()
    if exchange.exchange_date and exchange.exchange_date.strip():
        updateOps["exchange_date"] = exchange.exchange_date.strip()
    if len(exchange.participants) > 0:
        updateOps["participants"] = exchange.participants
    if len(exchange.requested) > 0:
        for p in exchange.requested:
            usr = database["users"].find_one({"email": p["email"]})
            if usr is None:
                exchange.requested.remove(p)

    updateOps["requested"] = exchange.requested
    if exchange.comments and exchange.comments.strip():
        updateOps["comments"] = exchange.comments.strip()

    for participant in exchange.requested:
        # Crear la token de sesion falsa para que acepte la invitacion
        token = signForJoin(exchange.id,
                            participant["email"], exchange.deadline)
        link = f"http://127.0.0.1:3000/email/accept-invitation?tk={token}"
        send_confirm_email(
            to=participant["email"], link=link, name=participant["name"], user=usrInfo["name"], date=exData["exchange_date"], subject=exData["name"], deadline=exchange.deadline)

    try:
        database["exchanges"].find_one_and_update(
            {"_id": exchange.id}, {"$set": updateOps})
        return JSONResponse(status_code=200, content={"message": "Se ha actualizado la informacion del evento"})
    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"error": "Ha ocurrido un error al actualizar el evento"})
    finally:
        client.close()


@router.patch("/prefs")
def updateUserPrefs(prefs: UpdateExchangePref, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    exUp = database["exchanges"].update_one({"_id": prefs.id, "participants.email": requestInfo["email"]}, {
                                            "$set":  {"participants.$.pref": prefs.selected_topic}})

    if exUp is None:
        return JSONResponse(status_code=404, content={"error": "No se ha encontrado el evento a actualizar"})

    return JSONResponse(status_code=200, content={"message": "Se ha actualizado correctamente su preferencia"})


@router.delete("/{id}")
def deleteEvent(id: str, request: Request):
    requestInfo = validateRequest(request)

    if requestInfo["status"] != 200:
        return JSONResponse(status_code=requestInfo["status"], content={"error": requestInfo["error"]})

    client = db.getMongoConn()
    database = client["WA"]

    exInfo = database["exchanges"].find_one({"_id": id})

    if exInfo["organizer"] != requestInfo["id"]:
        return JSONResponse(status_code=401, content={"error": "Usted no tiene los permisos necesarios para realizar la accion"})

    try:
        database["exchanges"].find_one_and_delete({"_id": id})
        return JSONResponse(status_code=200, content={"message": "Se ha eliminado correctamente el evento"})
    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"error": "Ha ocurrido un error al eliminar el evento"})
    finally:
        client.close()
