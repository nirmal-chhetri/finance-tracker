from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models.debt import Debt, DebtCreate, DebtUpdate
from app.services.debt_calculator import calculate_debt_payoff

router = APIRouter(prefix="/api/debts", tags=["debts"])

@router.get("", response_model=List[Debt])
def list_debts(session: Session = Depends(get_session)):
    return session.exec(select(Debt).order_by(Debt.principal_balance.desc())).all()

@router.post("", response_model=Debt)
def create_debt(payload: DebtCreate, session: Session = Depends(get_session)):
    d = Debt.model_validate(payload)
    session.add(d)
    session.commit()
    session.refresh(d)
    return d

@router.put("/{debt_id}", response_model=Debt)
def update_debt(debt_id: str, payload: DebtUpdate, session: Session = Depends(get_session)):
    d = session.get(Debt, debt_id)
    if not d:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(d, k, v)
        
    session.add(d)
    session.commit()
    session.refresh(d)
    return d

@router.delete("/{debt_id}")
def delete_debt(debt_id: str, session: Session = Depends(get_session)):
    d = session.get(Debt, debt_id)
    if not d:
        raise HTTPException(status_code=404, detail="Debt not found")
    session.delete(d)
    session.commit()
    return {"message": "Debt deleted"}

@router.get("/compare-strategies")
def compare_strategies(extra_payment: float = Query(default=0.0, ge=0.0), session: Session = Depends(get_session)):
    debts = session.exec(select(Debt)).all()
    debts_data = [d.model_dump() for d in debts]
    return calculate_debt_payoff(debts_data, extra_monthly_budget=extra_payment)
