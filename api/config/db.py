from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()


def getMongoConn():
    usr = os.environ.get("DB_USER")
    pwd = os.environ.get("DB_PWD")
    host = os.environ.get("DB_HOST")
    db = os.environ.get("DB_NAME")

    cnStr = f"mongodb+srv://{usr}:{pwd}@{host}/{db}?retryWrites=true&w=majority"

    return MongoClient(cnStr)
