from pydantic import BaseModel
from typing import Optional


class NewExchange(BaseModel):
    code: Optional[str] = None
    name: str
    topics: Optional[list] = []
    max_amount: float
    deadline: Optional[str] = ""
    exchange_date: str
    participants: Optional[list] = []
    requested: list
    comments: Optional[str] = ""


class UpdateExchange(BaseModel):
    id: str
    code: Optional[str]
    name: Optional[str] = ""
    topics: Optional[list] = []
    max_amount: float = 0.0
    exchange_date: Optional[str] = ""
    deadline: Optional[str] = ""
    participants: Optional[list] = []
    requested: Optional[list] = []
    comments: Optional[str] = ""


class UpdateExchangePref(BaseModel):
    id: str
    selected_topic: str
