from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.goal import SavingsGoal, SavingsGoalCreate, SavingsGoalUpdate

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("", response_model=List[dict])
def list_goals(session: Session = Depends(get_session)):
    goals = session.exec(select(SavingsGoal).order_by(SavingsGoal.name)).all()
    results = []
    for g in goals:
        g_dict = g.model_dump()
        pct = round((g.current_amount / g.target_amount) * 100, 1) if g.target_amount > 0 else 0.0
        g_dict["progress_percentage"] = min(100.0, pct)
        g_dict["remaining_amount"] = max(0.0, round(g.target_amount - g.current_amount, 2))
        results.append(g_dict)
    return results

@router.post("", response_model=SavingsGoal)
def create_goal(payload: SavingsGoalCreate, session: Session = Depends(get_session)):
    g = SavingsGoal.model_validate(payload)
    session.add(g)
    session.commit()
    session.refresh(g)
    return g

@router.put("/{goal_id}", response_model=SavingsGoal)
def update_goal(goal_id: str, payload: SavingsGoalUpdate, session: Session = Depends(get_session)):
    g = session.get(SavingsGoal, goal_id)
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(g, k, v)
        
    session.add(g)
    session.commit()
    session.refresh(g)
    return g

@router.delete("/{goal_id}")
def delete_goal(goal_id: str, session: Session = Depends(get_session)):
    g = session.get(SavingsGoal, goal_id)
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    session.delete(g)
    session.commit()
    return {"message": "Goal deleted"}
