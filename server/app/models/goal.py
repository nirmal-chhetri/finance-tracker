import uuid
from typing import Optional
from datetime import date as dt_date
from sqlmodel import SQLModel, Field

class SavingsGoal(SQLModel, table=True):
    __tablename__ = "savings_goals"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    target_amount: float # in base currency
    current_amount: float = Field(default=0.0)
    target_date: Optional[dt_date] = None
    icon: Optional[str] = "target"
    color: Optional[str] = "#10b981"

class SavingsGoalCreate(SQLModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[dt_date] = None
    icon: Optional[str] = "target"
    color: Optional[str] = "#10b981"

class SavingsGoalUpdate(SQLModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[dt_date] = None
    icon: Optional[str] = None
    color: Optional[str] = None
