from sqlmodel import Session, select
from app.models.currency import Currency
from app.config import DEFAULT_BASE_CURRENCY

def get_base_currency(session: Session) -> Currency:
    stmt = select(Currency).where(Currency.is_base == True)
    curr = session.exec(stmt).first()
    if not curr:
        # Fallback to USD or first available
        curr = session.get(Currency, DEFAULT_BASE_CURRENCY)
    return curr

def convert_to_base(amount: float, from_currency_code: str, session: Session) -> tuple[float, float]:
    """
    Returns (amount_in_base, exchange_rate_used)
    rate_to_base is defined as: 1 base = X foreign_currency, or amount_base = amount / rate_to_base
    For example: 1 USD = 86.5 INR. If amount is 8650 INR, amount_base = 8650 / 86.5 = 100 USD.
    If 1 USD = 0.92 EUR. If amount is 92 EUR, amount_base = 92 / 0.92 = 100 USD.
    """
    if not from_currency_code:
        return amount, 1.0
    
    base_curr = get_base_currency(session)
    if not base_curr or from_currency_code == base_curr.code:
        return amount, 1.0

    curr = session.get(Currency, from_currency_code)
    if not curr or curr.exchange_rate_to_base <= 0:
        return amount, 1.0
    
    rate = curr.exchange_rate_to_base
    amount_base = amount / rate
    return round(amount_base, 2), rate

def convert_from_base(amount_base: float, target_currency_code: str, session: Session) -> float:
    base_curr = get_base_currency(session)
    if not base_curr or target_currency_code == base_curr.code:
        return amount_base
    
    curr = session.get(Currency, target_currency_code)
    if not curr or curr.exchange_rate_to_base <= 0:
        return amount_base
    
    return round(amount_base * curr.exchange_rate_to_base, 2)
