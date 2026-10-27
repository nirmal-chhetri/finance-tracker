from datetime import date, timedelta
from typing import List, Dict, Any
from sqlmodel import Session, select
from app.models.account import Account
from app.models.recurring import RecurringRule
from app.services.currency_service import convert_to_base

def calculate_forecast(session: Session, days: int = 90) -> List[Dict[str, Any]]:
    """
    Projects daily balances over the next N days by tracking:
    - Current cash/checking balances (in base currency)
    - Scheduled recurring bills/incomes based on their frequency & due date
    """
    accounts = session.exec(select(Account).where(Account.is_archived == False)).all()
    recurring_rules = session.exec(select(RecurringRule).where(RecurringRule.is_active == True)).all()

    # Sum starting liquid balances (checking, savings, cash)
    initial_liquid = 0.0
    for acc in accounts:
        if acc.type in ["checking", "savings", "cash"]:
            base_amt, _ = convert_to_base(acc.current_balance, acc.currency, session)
            initial_liquid += base_amt

    today = date.today()
    timeline = []
    running_balance = initial_liquid

    # Pre-map recurring events for the forecast window
    scheduled_events: Dict[date, List[Dict[str, Any]]] = {}
    
    for rule in recurring_rules:
        # Step forward up to today + days
        cur_date = rule.next_due_date
        # In case next_due_date was in the past, align it
        while cur_date < today:
            cur_date = _advance_date(cur_date, rule.frequency)
        
        while cur_date <= today + timedelta(days=days):
            if cur_date not in scheduled_events:
                scheduled_events[cur_date] = []
            
            # Find account currency to convert
            acc = next((a for a in accounts if a.id == rule.account_id), None)
            curr = acc.currency if acc else "USD"
            base_amount, _ = convert_to_base(rule.amount, curr, session)
            
            scheduled_events[cur_date].append({
                "name": rule.name,
                "amount": base_amount,
                "frequency": rule.frequency
            })
            cur_date = _advance_date(cur_date, rule.frequency)

    # Build day-by-day trajectory
    for d in range(days + 1):
        target_day = today + timedelta(days=d)
        events_today = scheduled_events.get(target_day, [])
        net_change_today = 0.0

        for ev in events_today:
            # Recurring expenses decrease liquid balance; if amount is negative (or category is income) it increases
            net_change_today -= ev["amount"]

        running_balance += net_change_today

        # Sample every 2-3 days or whenever an event occurs to keep payload clean
        if d % 3 == 0 or events_today or d == days:
            timeline.append({
                "date": target_day.strftime("%Y-%m-%d"),
                "projected_balance": round(running_balance, 2),
                "events_count": len(events_today),
                "has_alert": running_balance < 500.0 # liquidity warning threshold
            })

    return timeline

def _advance_date(cur: date, frequency: str) -> date:
    if frequency == "weekly":
        return cur + timedelta(days=7)
    elif frequency == "biweekly":
        return cur + timedelta(days=14)
    elif frequency == "quarterly":
        # approx 90 days or 3 months
        month = cur.month + 3
        year = cur.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        day = min(cur.day, 28)
        return date(year, month, day)
    elif frequency == "yearly":
        return date(cur.year + 1, cur.month, min(cur.day, 28))
    else: # monthly default
        month = cur.month + 1
        year = cur.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        day = min(cur.day, 28)
        return date(year, month, day)
