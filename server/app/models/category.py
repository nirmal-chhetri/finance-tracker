import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    parent_id: Optional[str] = Field(default=None, foreign_key="categories.id")
    group_type: str = Field(default="wants") # needs (50%), wants (30%), savings_debt (20%), income
    color: Optional[str] = "#6b7280"
    icon: Optional[str] = "tag"
    is_system: bool = Field(default=False)

class CategoryCreate(SQLModel):
    name: str
    parent_id: Optional[str] = None
    group_type: str = "wants"
    color: Optional[str] = "#6b7280"
    icon: Optional[str] = "tag"

class CategoryUpdate(SQLModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None
    group_type: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
