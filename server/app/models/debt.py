import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class Debt(SQLModel, table=True):
    __tablename__ = "debts"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    principal_balance: float
    interest_rate_apr: float # percentage e.g. 18.5
    min_monthly_payment: float
    due_day_of_month: Optional[int] = 1

class DebtCreate(SQLModel):
    name: str
    principal_balance: float
    interest_rate_apr: float
    min_monthly_payment: float
    due_day_of_month: Optional[int] = 1

class DebtUpdate(SQLModel):
    name: Optional[str] = None
    principal_balance: Optional[float] = None
    interest_rate_apr: Optional[float] = None
    min_monthly_payment: Optional[float] = None
    due_day_of_month: Optional[int] = None
