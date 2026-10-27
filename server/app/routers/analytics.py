from datetime import date, datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.services.currency_service import convert_to_base, get_base_currency

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
def get_summary(session: Session = Depends(get_session)) -> Dict[str, Any]:
    base_curr = get_base_currency(session)
    accounts = session.exec(select(Account).where(Account.is_archived == False)).all()

    total_assets = 0.0
    total_liabilities = 0.0
    cash_total = 0.0
    investments_total = 0.0
    credit_debt_total = 0.0

    for a in accounts:
        amt_base, _ = convert_to_base(a.current_balance, a.currency, session)
        if a.type in ["checking", "savings", "cash"]:
            cash_total += amt_base
            total_assets += amt_base
        elif a.type in ["investment", "asset"]:
            investments_total += amt_base
            total_assets += amt_base
        elif a.type in ["credit", "loan", "mortgage"]:
            # Credit/loan current_balance represents debt owed
            credit_debt_total += amt_base
            total_liabilities += amt_base

    net_worth = total_assets - total_liabilities

    # Current month cashflow
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    txns = session.exec(
        select(Transaction)
        .where(Transaction.date >= start_of_month)
    ).all()

    monthly_income = sum(t.amount_base for t in txns if t.type == "income")
    monthly_expenses = sum(t.amount_base for t in txns if t.type == "expense")
    net_savings = monthly_income - monthly_expenses
    savings_rate = round((net_savings / monthly_income) * 100, 1) if monthly_income > 0 else 0.0

    return {
        "base_currency": base_curr.code if base_curr else "USD",
        "base_symbol": base_curr.symbol if base_curr else "$",
        "net_worth": round(net_worth, 2),
        "total_assets": round(total_assets, 2),
        "total_liabilities": round(total_liabilities, 2),
        "cash_total": round(cash_total, 2),
        "investments_total": round(investments_total, 2),
        "credit_debt_total": round(credit_debt_total, 2),
        "monthly_income": round(monthly_income, 2),
        "monthly_expenses": round(monthly_expenses, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate_pct": savings_rate
    }

@router.get("/cashflow-trends")
def get_cashflow_trends(months: int = Query(default=6, le=24), session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    today = date.today()
    trends = []

    for i in range(months - 1, -1, -1):
        # Calculate year and month
        y = today.year
        m = today.month - i
        while m <= 0:
            m += 12
            y -= 1
        
        # Start and end date for that month
        start_d = date(y, m, 1)
        if m == 12:
            end_d = date(y + 1, 1, 1) - timedelta(days=1)
        else:
            end_d = date(y, m + 1, 1) - timedelta(days=1)

        txns = session.exec(
            select(Transaction)
            .where(Transaction.date >= start_d)
            .where(Transaction.date <= end_d)
        ).all()

        inc = sum(t.amount_base for t in txns if t.type == "income")
        exp = sum(t.amount_base for t in txns if t.type == "expense")
        savings = inc - exp

        trends.append({
            "period": f"{y}-{m:02d}",
            "month_label": start_d.strftime("%b %y"),
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "savings": round(savings, 2)
        })

    return trends

@router.get("/rule-50-30-20")
def get_rule_breakdown(session: Session = Depends(get_session)) -> Dict[str, Any]:
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    txns = session.exec(
        select(Transaction)
        .where(Transaction.type == "expense")
        .where(Transaction.date >= start_of_month)
    ).all()

    categories = {c.id: c for c in session.exec(select(Category)).all()}

    needs_total = 0.0
    wants_total = 0.0
    savings_debt_total = 0.0
    uncategorized_total = 0.0

    for t in txns:
        cat = categories.get(t.category_id)
        if not cat:
            uncategorized_total += t.amount_base
        elif cat.group_type == "needs":
            needs_total += t.amount_base
        elif cat.group_type == "wants":
            wants_total += t.amount_base
        elif cat.group_type == "savings_debt":
            savings_debt_total += t.amount_base
        else:
            wants_total += t.amount_base

    total_expense = needs_total + wants_total + savings_debt_total + uncategorized_total
    
    if total_expense > 0:
        needs_pct = round((needs_total / total_expense) * 100, 1)
        wants_pct = round((wants_total / total_expense) * 100, 1)
        savings_pct = round((savings_debt_total / total_expense) * 100, 1)
        uncat_pct = round((uncategorized_total / total_expense) * 100, 1)
    else:
        needs_pct = wants_pct = savings_pct = uncat_pct = 0.0

    return {
        "needs_amount": round(needs_total, 2),
        "needs_pct": needs_pct,
        "wants_amount": round(wants_total, 2),
        "wants_pct": wants_pct,
        "savings_amount": round(savings_debt_total, 2),
        "savings_pct": savings_pct,
        "uncategorized_amount": round(uncategorized_total, 2),
        "total_spent": round(total_expense, 2)
    }

@router.get("/category-breakdown")
def get_category_breakdown(period: str = Query(default="month"), session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
    today = date.today()
    if period == "month":
        start_date = date(today.year, today.month, 1)
    elif period == "year":
        start_date = date(today.year, 1, 1)
    else:
        start_date = date(today.year, today.month, 1)

    txns = session.exec(
        select(Transaction)
        .where(Transaction.type == "expense")
        .where(Transaction.date >= start_date)
    ).all()

    categories = {c.id: c for c in session.exec(select(Category)).all()}
    cat_totals: Dict[str, float] = {}

    for t in txns:
        c_id = t.category_id or "uncategorized"
        cat_totals[c_id] = cat_totals.get(c_id, 0.0) + t.amount_base

    results = []
    for c_id, total in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
        if c_id == "uncategorized":
            name = "Uncategorized"
            color = "#9ca3af"
        else:
            cat = categories.get(c_id)
            name = cat.name if cat else "Other"
            color = cat.color if cat and cat.color else "#6b7280"

        results.append({
            "category_id": c_id,
            "category_name": name,
            "amount": round(total, 2),
            "color": color
        })

    return results
