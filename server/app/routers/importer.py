from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.account import Account
from app.models.transaction import Transaction
from app.services.csv_parser import parse_bank_csv
from app.services.currency_service import convert_to_base
from app.routers.transactions import adjust_account_balance

router = APIRouter(prefix="/api/import", tags=["import"])

@router.post("/preview")
async def preview_csv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text_content = content.decode("utf-8-sig", errors="ignore")
        parsed = parse_bank_csv(text_content)
        return {
            "filename": file.filename,
            "total_rows": len(parsed),
            "preview": parsed[:20],
            "all_rows": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

@router.post("/commit")
def commit_imported_transactions(
    account_id: str = Form(...),
    items: List[dict] = Form(...), # or JSON body
    session: Session = Depends(get_session)
):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    imported_count = 0
    duplicate_count = 0

    for item in items:
        fp = item.get("fingerprint")
        if fp:
            existing = session.exec(select(Transaction).where(Transaction.fingerprint == fp)).first()
            if existing:
                duplicate_count += 1
                continue

        amt = float(item["amount"])
        base_amt, rate = convert_to_base(amt, acc.currency, session)
        txn_date = datetime.strptime(item["date"], "%Y-%m-%d").date()

        txn = Transaction(
            account_id=account_id,
            type=item.get("type", "expense"),
            amount_native=amt,
            amount_base=base_amt,
            exchange_rate=rate,
            date=txn_date,
            merchant=item.get("merchant", "Imported Payee"),
            raw_description=item.get("raw_description"),
            fingerprint=fp
        )

        adjust_account_balance(acc, txn.type, amt, is_reversal=False)
        session.add(txn)
        imported_count += 1

    session.add(acc)
    session.commit()

    return {
        "imported_count": imported_count,
        "duplicate_count": duplicate_count
    }
