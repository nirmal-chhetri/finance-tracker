from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.category import Category, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("", response_model=List[Category])
def list_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category).order_by(Category.name)).all()

@router.post("", response_model=Category)
def create_category(payload: CategoryCreate, session: Session = Depends(get_session)):
    cat = Category.model_validate(payload)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat

@router.put("/{category_id}", response_model=Category)
def update_category(category_id: str, payload: CategoryUpdate, session: Session = Depends(get_session)):
    cat = session.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(cat, k, v)
        
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat

@router.delete("/{category_id}")
def delete_category(category_id: str, session: Session = Depends(get_session)):
    cat = session.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.is_system:
        raise HTTPException(status_code=400, detail="Cannot delete default system category")
    session.delete(cat)
    session.commit()
    return {"message": "Category deleted"}
