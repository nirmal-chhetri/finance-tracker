from typing import List, Optional
from datetime import date, datetime
import calendar
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from app.database import get_session
from app.models.budget import Budget, BudgetCreate, BudgetUpdate
from app.models.category import Category
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/budgets", tags=["budgets"])

@router.get("", response_model=List[dict])
def get_monthly_budgets(month: Optional[str] = None, session: Session = Depends(get_session)):
    """
    month format: YYYY-MM. Defaults to current month.
    Returns budgeted limits, actual spending to date, remaining budget, pacing status, and safe daily burn.
    """
    if not month:
        month = datetime.utcnow().strftime("%Y-%m")

    year, m_num = [int(x) for x in month.split("-")]
    num_days = calendar.monthrange(year, m_num)[1]
    
    today = date.today()
    if today.year == year and today.month == m_num:
        day_of_month = today.day
    elif today > date(year, m_num, num_days):
        day_of_month = num_days # Month already completed
    else:
        day_of_month = 1 # Month in the future

    days_remaining = max(1, num_days - day_of_month + 1)
    month_progress_pct = (day_of_month / num_days) * 100.0

    # Fetch categories
    categories = session.exec(select(Category).where(Category.group_type != "income")).all()
    # Fetch existing budgets for this month
    budgets = {b.category_id: b for b in session.exec(select(Budget).where(Budget.period == month)).all()}

    # Compute actual expenses per category in this month (in base currency)
    start_date = date(year, m_num, 1)
    end_date = date(year, m_num, num_days)

    txns = session.exec(
        select(Transaction)
        .where(Transaction.type == "expense")
        .where(Transaction.date >= start_date)
        .where(Transaction.date <= end_date)
    ).all()

    actuals_by_cat = {}
    for t in txns:
        if t.category_id:
            actuals_by_cat[t.category_id] = actuals_by_cat.get(t.category_id, 0.0) + t.amount_base

    results = []
    for cat in categories:
        b = budgets.get(cat.id)
        target = b.target_amount if b else 0.0
        spent = round(actuals_by_cat.get(cat.id, 0.0), 2)
        remaining = round(target - spent, 2)
        
        # Pacing Index: (spent / target) / (day_of_month / num_days)
        if target > 0:
            burn_pct = (spent / target) * 100.0
            pacing_index = round(burn_pct / month_progress_pct, 2) if month_progress_pct > 0 else 1.0
            safe_daily_spend = max(0.0, round(remaining / days_remaining, 2))
        else:
            burn_pct = 0.0
            pacing_index = 1.0
            safe_daily_spend = 0.0

        results.append({
            "category_id": cat.id,
            "category_name": cat.name,
            "group_type": cat.group_type,
            "icon": cat.icon,
            "color": cat.color,
            "budget_id": b.id if b else None,
            "period": month,
            "target_amount": target,
            "actual_spent": spent,
            "remaining_amount": remaining,
            "burn_percentage": round(burn_pct, 1),
            "pacing_index": pacing_index,
            "is_overspent": spent > target and target > 0,
            "is_warning": pacing_index > 1.15 and spent <= target, # spending too fast
            "safe_daily_spend": safe_daily_spend,
            "days_remaining": days_remaining
        })

    return results

@router.post("", response_model=Budget)
def set_budget(payload: BudgetCreate, session: Session = Depends(get_session)):
    stmt = select(Budget).where(Budget.category_id == payload.category_id).where(Budget.period == payload.period)
    existing = session.exec(stmt).first()
    if existing:
        existing.target_amount = payload.target_amount
        existing.rollover_enabled = payload.rollover_enabled
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    
    b = Budget.model_validate(payload)
    session.add(b)
    session.commit()
    session.refresh(b)
    return b
