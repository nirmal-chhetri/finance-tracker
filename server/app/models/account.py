import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

def get_utc_now():
    return datetime.now(timezone.utc)

class Account(SQLModel, table=True):
    __tablename__ = "accounts"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    type: str = Field(index=True) # checking, savings, credit, investment, cash, loan, mortgage, asset
    currency: str = Field(default="USD", foreign_key="currencies.code")
    institution: Optional[str] = None
    current_balance: float = Field(default=0.0) # in native account currency
    credit_limit: Optional[float] = None
    apr: Optional[float] = None
    billing_cycle_day: Optional[int] = None
    due_day: Optional[int] = None
    color: Optional[str] = "#3b82f6"
    icon: Optional[str] = "wallet"
    is_archived: bool = Field(default=False)
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)

class AccountCreate(SQLModel):
    name: str
    type: str
    currency: str = "USD"
    institution: Optional[str] = None
    current_balance: float = 0.0
    credit_limit: Optional[float] = None
    apr: Optional[float] = None
    billing_cycle_day: Optional[int] = None
    due_day: Optional[int] = None
    color: Optional[str] = "#3b82f6"
    icon: Optional[str] = "wallet"

class AccountUpdate(SQLModel):
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None
    institution: Optional[str] = None
    current_balance: Optional[float] = None
    credit_limit: Optional[float] = None
    apr: Optional[float] = None
    billing_cycle_day: Optional[int] = None
    due_day: Optional[int] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_archived: Optional[bool] = None
