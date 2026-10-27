from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models.account import Account
from app.models.transaction import Transaction, TransactionCreate, TransactionUpdate
from app.services.currency_service import convert_to_base

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

def adjust_account_balance(acc: Account, txn_type: str, amount: float, is_reversal: bool = False):
    """
    Adjusts account balance based on account type and transaction type.
    For standard asset accounts (checking, savings, cash):
      - income adds to balance
      - expense subtracts from balance
    For liability accounts (credit card, loan):
      - expense (new charge) increases debt balance
      - income/payment decreases debt balance
    If is_reversal=True, the adjustment direction is inverted (e.g., when deleting).
    """
    factor = -1.0 if is_reversal else 1.0
    is_liability = acc.type in ["credit", "loan", "mortgage"]

    if txn_type == "income":
        if is_liability:
            acc.current_balance -= factor * amount # debt payment reduces balance
        else:
            acc.current_balance += factor * amount
    elif txn_type == "expense":
        if is_liability:
            acc.current_balance += factor * amount # new purchase increases debt
        else:
            acc.current_balance -= factor * amount
    elif txn_type == "transfer":
        # Outflow from source account
        if is_liability:
            acc.current_balance += factor * amount
        else:
            acc.current_balance -= factor * amount

@router.get("", response_model=List[dict])
def list_transactions(
    account_id: Optional[str] = None,
    category_id: Optional[str] = None,
    txn_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    session: Session = Depends(get_session)
):
    stmt = select(Transaction)
    if account_id:
        stmt = stmt.where((Transaction.account_id == account_id) | (Transaction.destination_account_id == account_id))
    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    if txn_type:
        stmt = stmt.where(Transaction.type == txn_type)
    if start_date:
        stmt = stmt.where(Transaction.date >= start_date)
    if end_date:
        stmt = stmt.where(Transaction.date <= end_date)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(Transaction.merchant.ilike(pattern) | Transaction.notes.ilike(pattern))
    
    stmt = stmt.order_by(Transaction.date.desc(), Transaction.created_at.desc()).offset(offset).limit(limit)
    txns = session.exec(stmt).all()
    
    # Preload accounts for fast lookup
    accounts = {a.id: a for a in session.exec(select(Account)).all()}
    
    results = []
    for t in txns:
        t_dict = t.model_dump()
        acc = accounts.get(t.account_id)
        dest_acc = accounts.get(t.destination_account_id) if t.destination_account_id else None
        t_dict["account_name"] = acc.name if acc else "Unknown"
        t_dict["account_currency"] = acc.currency if acc else "USD"
        t_dict["destination_account_name"] = dest_acc.name if dest_acc else None
        results.append(t_dict)
        
    return results

@router.post("", response_model=Transaction)
def create_transaction(payload: TransactionCreate, session: Session = Depends(get_session)):
    if payload.amount_native <= 0:
        raise HTTPException(status_code=400, detail="Transaction amount must be strictly greater than zero")

    source_acc = session.get(Account, payload.account_id)
    if not source_acc:
        raise HTTPException(status_code=404, detail="Source account not found")

    dest_acc = None
    if payload.type == "transfer":
        if not payload.destination_account_id:
            raise HTTPException(status_code=400, detail="Destination account required for transfers")
        if payload.account_id == payload.destination_account_id:
            raise HTTPException(status_code=400, detail="Source and destination accounts must be different for transfers")
        dest_acc = session.get(Account, payload.destination_account_id)
        if not dest_acc:
            raise HTTPException(status_code=404, detail="Destination account not found")

    # Compute base currency amount
    base_amt, rate = convert_to_base(payload.amount_native, source_acc.currency, session)

    txn = Transaction(
        account_id=payload.account_id,
        destination_account_id=payload.destination_account_id,
        category_id=payload.category_id,
        type=payload.type,
        amount_native=round(payload.amount_native, 2),
        amount_base=base_amt,
        exchange_rate=rate,
        date=payload.date,
        merchant=payload.merchant,
        raw_description=payload.raw_description,
        notes=payload.notes,
        status=payload.status,
        tags=payload.tags,
        recurring_rule_id=payload.recurring_rule_id
    )

    # Atomic balance updates
    adjust_account_balance(source_acc, payload.type, payload.amount_native, is_reversal=False)
    source_acc.current_balance = round(source_acc.current_balance, 2)
    session.add(source_acc)

    if dest_acc and payload.type == "transfer":
        # Destination account receives inflow in its own currency
        dest_amount = convert_from_base(base_amt, dest_acc.currency, session)
        adjust_account_balance(dest_acc, "income", dest_amount, is_reversal=False)
        dest_acc.current_balance = round(dest_acc.current_balance, 2)
        session.add(dest_acc)

    session.add(txn)
    session.commit()
    session.refresh(txn)
    return txn

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: str, session: Session = Depends(get_session)):
    txn = session.get(Transaction, transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    source_acc = session.get(Account, txn.account_id)
    if source_acc:
        adjust_account_balance(source_acc, txn.type, txn.amount_native, is_reversal=True)
        source_acc.current_balance = round(source_acc.current_balance, 2)
        session.add(source_acc)

    if txn.destination_account_id and txn.type == "transfer":
        dest_acc = session.get(Account, txn.destination_account_id)
        if dest_acc:
            dest_amount = convert_from_base(txn.amount_base, dest_acc.currency, session)
            adjust_account_balance(dest_acc, "income", dest_amount, is_reversal=True)
            dest_acc.current_balance = round(dest_acc.current_balance, 2)
            session.add(dest_acc)

    session.delete(txn)
    session.commit()
    return {"message": "Transaction deleted and balance adjusted"}
