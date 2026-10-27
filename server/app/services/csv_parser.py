import io
import csv
import hashlib
from datetime import datetime, date
from typing import List, Dict, Any, Optional

def parse_bank_csv(
    file_content: str,
    date_col: Optional[str] = None,
    desc_col: Optional[str] = None,
    amount_col: Optional[str] = None,
    debit_col: Optional[str] = None,
    credit_col: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Parses arbitrary CSV bank statements, auto-detecting headers if not explicitly supplied.
    Generates a duplicate-detection fingerprint (sha256 of date + amount + merchant).
    """
    reader = csv.DictReader(io.StringIO(file_content))
    fieldnames = reader.fieldnames or []
    normalized_fields = {f.strip().lower(): f for f in fieldnames}

    # Auto-detect headers if not provided
    if not date_col:
        for candidate in ["date", "transaction date", "posting date", "trans date", "txn date"]:
            if candidate in normalized_fields:
                date_col = normalized_fields[candidate]
                break

    if not desc_col:
        for candidate in ["description", "merchant", "payee", "memo", "details", "name", "narrative"]:
            if candidate in normalized_fields:
                desc_col = normalized_fields[candidate]
                break

    if not amount_col and not (debit_col or credit_col):
        for candidate in ["amount", "txn amount", "net amount", "total"]:
            if candidate in normalized_fields:
                amount_col = normalized_fields[candidate]
                break

    if not amount_col:
        if not debit_col:
            for candidate in ["debit", "withdrawal", "spent", "debit amount"]:
                if candidate in normalized_fields:
                    debit_col = normalized_fields[candidate]
                    break
        if not credit_col:
            for candidate in ["credit", "deposit", "received", "credit amount"]:
                if candidate in normalized_fields:
                    credit_col = normalized_fields[candidate]
                    break

    parsed_rows = []

    for row in reader:
        # 1. Parse Date
        raw_date = row.get(date_col, "").strip() if date_col else ""
        parsed_date = _parse_date_string(raw_date)
        if not parsed_date:
            continue

        # 2. Parse Description / Merchant
        raw_desc = row.get(desc_col, "").strip() if desc_col else "Unknown Payee"
        merchant = _clean_merchant_name(raw_desc)

        # 3. Parse Amount & Type
        amount = 0.0
        txn_type = "expense"

        if amount_col and row.get(amount_col):
            clean_str = row[amount_col].replace("$", "").replace(",", "").replace("€", "").replace("₹", "").replace("£", "").strip()
            # Handle accounting negative format: (123.45)
            if clean_str.startswith("(") and clean_str.endswith(")"):
                clean_str = "-" + clean_str[1:-1].strip()
            try:
                raw_amt = float(clean_str)
                if raw_amt < 0:
                    amount = abs(raw_amt)
                    txn_type = "expense"
                else:
                    amount = raw_amt
                    txn_type = "income"
            except ValueError:
                continue
        elif debit_col or credit_col:
            raw_debit = row.get(debit_col, "").replace("$", "").replace(",", "").strip() if debit_col else ""
            raw_credit = row.get(credit_col, "").replace("$", "").replace(",", "").strip() if credit_col else ""
            if raw_debit.startswith("(") and raw_debit.endswith(")"):
                raw_debit = raw_debit[1:-1].strip()
            if raw_credit.startswith("(") and raw_credit.endswith(")"):
                raw_credit = raw_credit[1:-1].strip()

            try:
                if raw_debit and float(raw_debit or 0) > 0:
                    amount = float(raw_debit)
                    txn_type = "expense"
                elif raw_credit and float(raw_credit or 0) > 0:
                    amount = float(raw_credit)
                    txn_type = "income"
                else:
                    continue
            except ValueError:
                continue

        if amount <= 0:
            continue

        # 4. Generate deduplication fingerprint
        fingerprint_source = f"{parsed_date.isoformat()}_{round(amount, 2)}_{merchant.lower()}"
        fingerprint = hashlib.sha256(fingerprint_source.encode("utf-8")).hexdigest()

        parsed_rows.append({
            "date": parsed_date.isoformat(),
            "merchant": merchant,
            "raw_description": raw_desc,
            "amount": round(amount, 2),
            "type": txn_type,
            "fingerprint": fingerprint
        })

    return parsed_rows

def _parse_date_string(val: str) -> Optional[date]:
    if not val:
        return None
    val = val.strip()
    formats = [
        "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y",
        "%d-%m-%Y", "%Y/%m/%d", "%b %d, %Y", "%d %b %Y",
        "%Y.%m.%d", "%d.%m.%Y", "%d-%b-%Y", "%d-%b-%y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(val, fmt).date()
        except ValueError:
            pass
    return None

def _clean_merchant_name(raw: str) -> str:
    # Remove common bank noise
    cleaned = raw.strip()
    prefixes_to_strip = ["POS PURCHASE", "CHECKCARD", "DEBIT CARD PURCHASE", "ACH WITHDRAWAL", "PAYMENT TO", "TRANSFER TO"]
    for p in prefixes_to_strip:
        if cleaned.upper().startswith(p):
            cleaned = cleaned[len(p):].strip()
    return cleaned[:100] or "Transaction"
