import uuid
from typing import Optional
from datetime import date as dt_date, datetime as dt_datetime, timezone
from sqlmodel import SQLModel, Field

def get_utc_now():
    return dt_datetime.now(timezone.utc)

class TransactionSplit(SQLModel, table=True):
    __tablename__ = "transaction_splits"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id")
    category_id: str = Field(foreign_key="categories.id")
    amount_native: float
    amount_base: float
    notes: Optional[str] = None

class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    account_id: str = Field(foreign_key="accounts.id", index=True)
    destination_account_id: Optional[str] = Field(default=None, foreign_key="accounts.id")
    category_id: Optional[str] = Field(default=None, foreign_key="categories.id", index=True)
    type: str = Field(index=True) # income, expense, transfer
    amount_native: float # in source account currency
    amount_base: float # in system base currency
    exchange_rate: float = Field(default=1.0)
    date: dt_date = Field(index=True)
    merchant: str = Field(index=True)
    raw_description: Optional[str] = None
    notes: Optional[str] = None
    status: str = Field(default="cleared") # cleared, pending, reconciled
    tags: Optional[str] = None # JSON string array e.g. '["#tax", "#business"]'
    has_splits: bool = Field(default=False)
    recurring_rule_id: Optional[str] = Field(default=None, foreign_key="recurring_rules.id")
    fingerprint: Optional[str] = Field(default=None, unique=True, index=True)
    created_at: dt_datetime = Field(default_factory=get_utc_now)
    updated_at: dt_datetime = Field(default_factory=get_utc_now)

class TransactionCreate(SQLModel):
    account_id: str
    destination_account_id: Optional[str] = None
    category_id: Optional[str] = None
    type: str
    amount_native: float
    date: dt_date
    merchant: str
    raw_description: Optional[str] = None
    notes: Optional[str] = None
    status: str = "cleared"
    tags: Optional[str] = None
    recurring_rule_id: Optional[str] = None

class TransactionUpdate(SQLModel):
    account_id: Optional[str] = None
    destination_account_id: Optional[str] = None
    category_id: Optional[str] = None
    type: Optional[str] = None
    amount_native: Optional[float] = None
    date: Optional[dt_date] = None
    merchant: Optional[str] = None
    raw_description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
