from datetime import date, timedelta
from sqlmodel import Session, select
from app.models.currency import Currency
from app.models.account import Account
from app.models.category import Category
from app.models.budget import Budget
from app.models.recurring import RecurringRule
from app.models.goal import SavingsGoal
from app.models.debt import Debt
from app.models.transaction import Transaction

def seed_database(session: Session):
    # 1. Currencies
    existing_curr = session.exec(select(Currency)).first()
    if not existing_curr:
        currencies = [
            Currency(code="USD", symbol="$", name="US Dollar", exchange_rate_to_base=1.0, is_base=True),
            Currency(code="EUR", symbol="€", name="Euro", exchange_rate_to_base=0.92, is_base=False),
            Currency(code="GBP", symbol="£", name="British Pound", exchange_rate_to_base=0.79, is_base=False),
            Currency(code="INR", symbol="₹", name="Indian Rupee", exchange_rate_to_base=86.50, is_base=False),
            Currency(code="CAD", symbol="CA$", name="Canadian Dollar", exchange_rate_to_base=1.38, is_base=False),
            Currency(code="AUD", symbol="AU$", name="Australian Dollar", exchange_rate_to_base=1.52, is_base=False),
            Currency(code="JPY", symbol="¥", name="Japanese Yen", exchange_rate_to_base=152.0, is_base=False),
        ]
        session.add_all(currencies)
        session.commit()

    # 2. Categories
    existing_cat = session.exec(select(Category)).first()
    if not existing_cat:
        categories = [
            # Needs (50%)
            Category(name="Housing & Rent", group_type="needs", color="#3b82f6", icon="home", is_system=True),
            Category(name="Groceries", group_type="needs", color="#10b981", icon="shopping-cart", is_system=True),
            Category(name="Utilities & Bills", group_type="needs", color="#06b6d4", icon="zap", is_system=True),
            Category(name="Healthcare & Medical", group_type="needs", color="#ef4444", icon="activity", is_system=True),
            Category(name="Transportation & Gas", group_type="needs", color="#f59e0b", icon="car", is_system=True),
            # Wants (30%)
            Category(name="Dining & Restaurants", group_type="wants", color="#8b5cf6", icon="coffee", is_system=True),
            Category(name="Entertainment & Media", group_type="wants", color="#ec4899", icon="film", is_system=True),
            Category(name="Shopping & Gadgets", group_type="wants", color="#14b8a6", icon="shopping-bag", is_system=True),
            Category(name="Travel & Holidays", group_type="wants", color="#f97316", icon="plane", is_system=True),
            Category(name="Fitness & Wellbeing", group_type="wants", color="#84cc16", icon="heart", is_system=True),
            # Savings & Debt (20%)
            Category(name="Emergency Fund", group_type="savings_debt", color="#10b981", icon="shield", is_system=True),
            Category(name="Investments / Brokerage", group_type="savings_debt", color="#6366f1", icon="trending-up", is_system=True),
            Category(name="Loan & Debt Payments", group_type="savings_debt", color="#d97706", icon="credit-card", is_system=True),
            # Income
            Category(name="Primary Salary", group_type="income", color="#059669", icon="dollar-sign", is_system=True),
            Category(name="Freelance / Consulting", group_type="income", color="#10b981", icon="briefcase", is_system=True),
            Category(name="Dividends & Capital Gains", group_type="income", color="#047857", icon="percent", is_system=True),
        ]
        session.add_all(categories)
        session.commit()

    # 3. Starter Accounts (if none exist)
    existing_acc = session.exec(select(Account)).first()
    if not existing_acc:
        acc1 = Account(
            name="Main Checking Account",
            type="checking",
            currency="USD",
            institution="Chase Bank",
            current_balance=4850.0,
            color="#2563eb",
            icon="landmark"
        )
        acc2 = Account(
            name="High Yield Savings (HYSA)",
            type="savings",
            currency="USD",
            institution="Marcus by Goldman Sachs",
            current_balance=18200.0,
            color="#059669",
            icon="vault"
        )
        acc3 = Account(
            name="Prime Rewards Credit Card",
            type="credit",
            currency="USD",
            institution="Chase",
            current_balance=845.50, # Debt balance
            credit_limit=10000.0,
            apr=19.99,
            billing_cycle_day=15,
            due_day=5,
            color="#7c3aed",
            icon="credit-card"
        )
        acc4 = Account(
            name="Index Fund Portfolio",
            type="investment",
            currency="USD",
            institution="Vanguard",
            current_balance=32400.0,
            color="#0d9488",
            icon="trending-up"
        )
        acc5 = Account(
            name="Euro Travel Account",
            type="checking",
            currency="EUR",
            institution="Wise",
            current_balance=1250.0, # 1250 EUR
            color="#ea580c",
            icon="globe"
        )
        session.add_all([acc1, acc2, acc3, acc4, acc5])
        session.commit()
        session.refresh(acc1)
        session.refresh(acc2)
        session.refresh(acc3)

        # 4. Recurring rules
        cats = {c.name: c for c in session.exec(select(Category)).all()}
        today = date.today()
        
        rule1 = RecurringRule(
            name="High-speed Internet & Fiber",
            account_id=acc1.id,
            category_id=cats.get("Utilities & Bills", None).id if "Utilities & Bills" in cats else None,
            amount=79.99,
            frequency="monthly",
            next_due_date=today + timedelta(days=4)
        )
        rule2 = RecurringRule(
            name="Spotify & Netflix Streaming",
            account_id=acc3.id,
            category_id=cats.get("Entertainment & Media", None).id if "Entertainment & Media" in cats else None,
            amount=32.98,
            frequency="monthly",
            next_due_date=today + timedelta(days=11)
        )
        rule3 = RecurringRule(
            name="Apartment Rent Transfer",
            account_id=acc1.id,
            category_id=cats.get("Housing & Rent", None).id if "Housing & Rent" in cats else None,
            amount=1650.00,
            frequency="monthly",
            next_due_date=date(today.year, today.month, 1) + timedelta(days=30)
        )
        session.add_all([rule1, rule2, rule3])

        # 5. Starter Budgets for current month
        cur_month = today.strftime("%Y-%m")
        if "Groceries" in cats:
            session.add(Budget(category_id=cats["Groceries"].id, period=cur_month, target_amount=600.0))
        if "Dining & Restaurants" in cats:
            session.add(Budget(category_id=cats["Dining & Restaurants"].id, period=cur_month, target_amount=350.0))
        if "Shopping & Gadgets" in cats:
            session.add(Budget(category_id=cats["Shopping & Gadgets"].id, period=cur_month, target_amount=250.0))
        if "Utilities & Bills" in cats:
            session.add(Budget(category_id=cats["Utilities & Bills"].id, period=cur_month, target_amount=200.0))

        # 6. Savings Goals
        g1 = SavingsGoal(name="Emergency Safety Net (6 Mo)", target_amount=20000.0, current_amount=18200.0, icon="shield", color="#059669")
        g2 = SavingsGoal(name="Tokyo Summer Trip", target_amount=4500.0, current_amount=2150.0, target_date=today + timedelta(days=180), icon="plane", color="#2563eb")
        session.add_all([g1, g2])

        # 7. Debts
        d1 = Debt(name="Auto Loan (Honda Civic)", principal_balance=6400.0, interest_rate_apr=4.9, min_monthly_payment=285.0, due_day_of_month=15)
        d2 = Debt(name="Student Loan (Federal Subsidized)", principal_balance=12500.0, interest_rate_apr=6.2, min_monthly_payment=160.0, due_day_of_month=22)
        session.add_all([d1, d2])

        # 8. Starter Transactions for current month
        t1 = Transaction(
            account_id=acc1.id,
            category_id=cats["Primary Salary"].id if "Primary Salary" in cats else None,
            type="income",
            amount_native=4200.0,
            amount_base=4200.0,
            exchange_rate=1.0,
            date=today - timedelta(days=12),
            merchant="Tech Employer Inc",
            notes="Bi-weekly direct deposit paycheck"
        )
        t2 = Transaction(
            account_id=acc1.id,
            category_id=cats["Housing & Rent"].id if "Housing & Rent" in cats else None,
            type="expense",
            amount_native=1650.0,
            amount_base=1650.0,
            exchange_rate=1.0,
            date=today - timedelta(days=20),
            merchant="Meridian Properties LLC",
            notes="Monthly apartment rent"
        )
        t3 = Transaction(
            account_id=acc3.id,
            category_id=cats["Groceries"].id if "Groceries" in cats else None,
            type="expense",
            amount_native=142.60,
            amount_base=142.60,
            exchange_rate=1.0,
            date=today - timedelta(days=3),
            merchant="Whole Foods Market",
            notes="Weekly organic groceries and pantry staples"
        )
        t4 = Transaction(
            account_id=acc3.id,
            category_id=cats["Dining & Restaurants"].id if "Dining & Restaurants" in cats else None,
            type="expense",
            amount_native=68.50,
            amount_base=68.50,
            exchange_rate=1.0,
            date=today - timedelta(days=1),
            merchant="Artisan Trattoria",
            notes="Dinner with friends"
        )
        session.add_all([t1, t2, t3, t4])
        session.commit()
