from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

def get_utc_now():
    return datetime.now(timezone.utc)

class Currency(SQLModel, table=True):
    __tablename__ = "currencies"

    code: str = Field(primary_key=True, max_length=5) # USD, EUR, INR, GBP, CAD
    symbol: str = Field(max_length=10) # $, €, ₹, £
    name: str = Field(max_length=50)
    exchange_rate_to_base: float = Field(default=1.0)
    is_base: bool = Field(default=False)
    updated_at: datetime = Field(default_factory=get_utc_now)

class CurrencyUpdate(SQLModel):
    exchange_rate_to_base: Optional[float] = None
    is_base: Optional[bool] = None
