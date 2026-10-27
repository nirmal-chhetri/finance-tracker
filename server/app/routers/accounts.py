from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.account import Account, AccountCreate, AccountUpdate
from app.services.currency_service import convert_to_base

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("", response_model=List[dict])
def list_accounts(include_archived: bool = False, session: Session = Depends(get_session)):
    stmt = select(Account)
    if not include_archived:
        stmt = stmt.where(Account.is_archived == False)
    stmt = stmt.order_by(Account.created_at)
    accounts = session.exec(stmt).all()
    
    results = []
    for acc in accounts:
        acc_dict = acc.model_dump()
        base_balance, rate = convert_to_base(acc.current_balance, acc.currency, session)
        acc_dict["balance_base"] = base_balance
        acc_dict["exchange_rate"] = rate
        
        # Credit utilization
        if acc.type == "credit" and acc.credit_limit and acc.credit_limit > 0:
            # Positive balance on credit card is debt
            acc_dict["utilization_percent"] = round((acc.current_balance / acc.credit_limit) * 100, 1)
        else:
            acc_dict["utilization_percent"] = None
            
        results.append(acc_dict)
    return results

@router.post("", response_model=Account)
def create_account(payload: AccountCreate, session: Session = Depends(get_session)):
    acc = Account.model_validate(payload)
    session.add(acc)
    session.commit()
    session.refresh(acc)
    return acc

@router.get("/{account_id}", response_model=Account)
def get_account(account_id: str, session: Session = Depends(get_session)):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc

@router.put("/{account_id}", response_model=Account)
def update_account(account_id: str, payload: AccountUpdate, session: Session = Depends(get_session)):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(acc, k, v)
    
    acc.updated_at = datetime.now(timezone.utc)
    session.add(acc)
    session.commit()
    session.refresh(acc)
    return acc

@router.delete("/{account_id}")
def delete_account(account_id: str, session: Session = Depends(get_session)):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    # Soft archive
    acc.is_archived = True
    session.add(acc)
    session.commit()
    return {"message": "Account archived successfully"}
