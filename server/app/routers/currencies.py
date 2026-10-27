from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.currency import Currency, CurrencyUpdate

router = APIRouter(prefix="/api/currencies", tags=["currencies"])

@router.get("", response_model=List[Currency])
def list_currencies(session: Session = Depends(get_session)):
    return session.exec(select(Currency).order_by(Currency.code)).all()

@router.put("/{code}", response_model=Currency)
def update_currency(code: str, payload: CurrencyUpdate, session: Session = Depends(get_session)):
    curr = session.get(Currency, code.upper())
    if not curr:
        raise HTTPException(status_code=404, detail="Currency not found")
    
    if payload.is_base is True:
        # Unset all other base flags
        all_curr = session.exec(select(Currency)).all()
        for c in all_curr:
            c.is_base = False
            session.add(c)
        curr.is_base = True
        curr.exchange_rate_to_base = 1.0

    if payload.exchange_rate_to_base is not None and not curr.is_base:
        curr.exchange_rate_to_base = payload.exchange_rate_to_base

    curr.updated_at = datetime.now(timezone.utc)
    session.add(curr)
    session.commit()
    session.refresh(curr)
    return curr
