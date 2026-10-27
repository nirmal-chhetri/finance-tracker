from typing import List, Dict, Any
from copy import deepcopy

def calculate_debt_payoff(debts_data: List[Dict[str, Any]], extra_monthly_budget: float = 0.0) -> Dict[str, Any]:
    """
    Computes side-by-side payoff comparison for Snowball vs Avalanche methods.
    debts_data: list of dicts with: name, principal_balance, interest_rate_apr, min_monthly_payment
    """
    if not debts_data:
        return {
            "snowball": {"total_interest": 0, "months": 0, "schedule": []},
            "avalanche": {"total_interest": 0, "months": 0, "schedule": []},
            "interest_difference": 0,
            "months_difference": 0
        }

    def simulate_strategy(items: List[Dict[str, Any]], strategy: str) -> Dict[str, Any]:
        # Snowball: sort by balance ascending
        # Avalanche: sort by interest_rate_apr descending
        debts = deepcopy(items)
        if strategy == "snowball":
            debts.sort(key=lambda x: x["principal_balance"])
        else:
            debts.sort(key=lambda x: x["interest_rate_apr"], reverse=True)

        month = 0
        total_interest = 0.0
        active_debts = debts
        schedule = []
        max_months = 360 # safety cap 30 years

        while active_debts and month < max_months:
            month += 1
            available_extra = extra_monthly_budget
            month_interest = 0.0
            remaining_debts = []

            # 1. Accrue monthly interest and pay minimums
            for d in active_debts:
                monthly_rate = (d["interest_rate_apr"] / 100.0) / 12.0
                interest = d["principal_balance"] * monthly_rate
                month_interest += interest
                d["principal_balance"] += interest

                min_payment = min(d["min_monthly_payment"], d["principal_balance"])
                d["principal_balance"] -= min_payment

            total_interest += month_interest

            # 2. Re-sort target debts and roll extra budget + freed up minimum payments to top priority debt
            if strategy == "snowball":
                active_debts.sort(key=lambda x: x["principal_balance"])
            else:
                active_debts.sort(key=lambda x: x["interest_rate_apr"], reverse=True)

            for d in active_debts:
                if d["principal_balance"] > 0 and available_extra > 0:
                    extra_pay = min(available_extra, d["principal_balance"])
                    d["principal_balance"] -= extra_pay
                    available_extra -= extra_pay

            # Check cleared debts
            for d in active_debts:
                if d["principal_balance"] > 0.5: # cents threshold
                    remaining_debts.append(d)
                else:
                    # Freed up minimum payment cascades to extra budget
                    available_extra += d["min_monthly_payment"]

            active_debts = remaining_debts
            total_remaining_balance = sum(d["principal_balance"] for d in active_debts)
            schedule.append({
                "month": month,
                "remaining_balance": round(total_remaining_balance, 2),
                "interest_accrued": round(month_interest, 2)
            })

        return {
            "total_interest": round(total_interest, 2),
            "months": month,
            "schedule": schedule
        }

    snowball_res = simulate_strategy(debts_data, "snowball")
    avalanche_res = simulate_strategy(debts_data, "avalanche")

    return {
        "snowball": snowball_res,
        "avalanche": avalanche_res,
        "interest_difference": round(abs(snowball_res["total_interest"] - avalanche_res["total_interest"]), 2),
        "months_difference": abs(snowball_res["months"] - avalanche_res["months"])
    }
