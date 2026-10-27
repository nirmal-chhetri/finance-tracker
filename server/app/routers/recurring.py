from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.recurring import RecurringRule, RecurringRuleCreate, RecurringRuleUpdate
from app.models.account import Account
from app.models.category import Category
from app.services.forecast_service import _advance_date, calculate_forecast

router = APIRouter(prefix="/api/recurring", tags=["recurring"])

@router.get("", response_model=List[dict])
def list_recurring_rules(session: Session = Depends(get_session)):
    rules = session.exec(select(RecurringRule).order_by(RecurringRule.next_due_date)).all()
    accounts = {a.id: a for a in session.exec(select(Account)).all()}
    categories = {c.id: c for c in session.exec(select(Category)).all()}

    results = []
    today = date.today()
    for r in rules:
        r_dict = r.model_dump()
        acc = accounts.get(r.account_id)
        cat = categories.get(r.category_id) if r.category_id else None
        r_dict["account_name"] = acc.name if acc else "Unknown"
        r_dict["account_currency"] = acc.currency if acc else "USD"
        r_dict["category_name"] = cat.name if cat else "Uncategorized"
        r_dict["days_until_due"] = (r.next_due_date - today).days
        results.append(r_dict)
    return results

@router.post("", response_model=RecurringRule)
def create_recurring_rule(payload: RecurringRuleCreate, session: Session = Depends(get_session)):
    rule = RecurringRule.model_validate(payload)
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

@router.put("/{rule_id}", response_model=RecurringRule)
def update_recurring_rule(rule_id: str, payload: RecurringRuleUpdate, session: Session = Depends(get_session)):
    rule = session.get(RecurringRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Recurring rule not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(rule, k, v)
        
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

@router.delete("/{rule_id}")
def delete_recurring_rule(rule_id: str, session: Session = Depends(get_session)):
    rule = session.get(RecurringRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Recurring rule not found")
    session.delete(rule)
    session.commit()
    return {"message": "Recurring rule deleted"}

@router.get("/forecast")
def get_forecast(days: int = 90, session: Session = Depends(get_session)):
    return calculate_forecast(session, days)
