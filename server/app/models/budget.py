import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class Budget(SQLModel, table=True):
    __tablename__ = "budgets"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    category_id: str = Field(foreign_key="categories.id", index=True)
    period: str = Field(index=True) # YYYY-MM
    target_amount: float # monthly target in base currency
    rollover_enabled: bool = Field(default=False)
    rollover_carried: float = Field(default=0.0)

class BudgetCreate(SQLModel):
    category_id: str
    period: str # YYYY-MM
    target_amount: float
    rollover_enabled: bool = False

class BudgetUpdate(SQLModel):
    target_amount: Optional[float] = None
    rollover_enabled: Optional[bool] = None
    rollover_carried: Optional[float] = None
