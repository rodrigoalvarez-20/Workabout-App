from fastapi import FastAPI
import os
import uvicorn

from routes.user import router as UserRouter
from routes.exchange import router as ExRouter

app = FastAPI()


@app.get("/api", status_code=200)
def testRoute():
    return {"message": "Api Correcta"}


app.include_router(UserRouter)
app.include_router(ExRouter)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(
        os.environ.get("API_PORT")), log_level="info")
