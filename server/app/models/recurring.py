import uuid
from typing import Optional
from datetime import date as dt_date
from sqlmodel import SQLModel, Field

class RecurringRule(SQLModel, table=True):
    __tablename__ = "recurring_rules"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    account_id: str = Field(foreign_key="accounts.id")
    category_id: Optional[str] = Field(default=None, foreign_key="categories.id")
    amount: float # in account currency
    frequency: str = Field(default="monthly") # weekly, biweekly, monthly, quarterly, yearly
    next_due_date: dt_date = Field(index=True)
    auto_record: bool = Field(default=False)
    is_active: bool = Field(default=True)

class RecurringRuleCreate(SQLModel):
    name: str
    account_id: str
    category_id: Optional[str] = None
    amount: float
    frequency: str = "monthly"
    next_due_date: dt_date
    auto_record: bool = False

class RecurringRuleUpdate(SQLModel):
    name: Optional[str] = None
    account_id: Optional[str] = None
    category_id: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None
    next_due_date: Optional[dt_date] = None
    auto_record: Optional[bool] = None
    is_active: Optional[bool] = None
