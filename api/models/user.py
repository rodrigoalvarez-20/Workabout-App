from pydantic import BaseModel
from typing import Optional


class UserFull(BaseModel):
    _id: int
    name: str
    alias: str
    email: str
    password: str
    friends: Optional[list] = []


class UserRegister(BaseModel):
    name: str
    alias: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str]
    alias: Optional[str]
    friends: Optional[list]
