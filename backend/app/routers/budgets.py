from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Budget, Expense
from ..schemas import BudgetCreate, BudgetUpdate, BudgetResponse

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetResponse])
def get_budgets(db: Session = Depends(get_db)):
    budgets = db.query(Budget).all()
    expenses = db.query(Expense).all()

    result = []
    for b in budgets:
        spent = sum(e.amount for e in expenses if e.category.lower() == b.category.lower())
        rem = max(0.0, b.monthly_limit - spent)
        pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0.0
        status = "Exceeded" if spent > b.monthly_limit else ("Warning" if pct >= b.alert_threshold else "Normal")

        result.append(
            BudgetResponse(
                id=b.id,
                category=b.category,
                monthly_limit=b.monthly_limit,
                alert_threshold=b.alert_threshold,
                spent=round(spent, 2),
                remaining=round(rem, 2),
                percentage=round(pct, 1),
                status=status,
            )
        )
    return result


@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(budget_in: BudgetCreate, db: Session = Depends(get_db)):
    existing = db.query(Budget).filter(Budget.category.ilike(budget_in.category)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Budget for this category already exists")

    budget = Budget(
        category=budget_in.category,
        monthly_limit=budget_in.monthly_limit,
        alert_threshold=budget_in.alert_threshold,
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)

    # Calculate current spending for response
    expenses = db.query(Expense).filter(Expense.category.ilike(budget.category)).all()
    spent = sum(e.amount for e in expenses)
    rem = max(0.0, budget.monthly_limit - spent)
    pct = (spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0.0

    return BudgetResponse(
        id=budget.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        alert_threshold=budget.alert_threshold,
        spent=round(spent, 2),
        remaining=round(rem, 2),
        percentage=round(pct, 1),
        status="Exceeded" if spent > budget.monthly_limit else ("Warning" if pct >= budget.alert_threshold else "Normal"),
    )


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_in: BudgetUpdate, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if budget_in.monthly_limit is not None:
        budget.monthly_limit = budget_in.monthly_limit
    if budget_in.alert_threshold is not None:
        budget.alert_threshold = budget_in.alert_threshold

    db.commit()
    db.refresh(budget)

    expenses = db.query(Expense).filter(Expense.category.ilike(budget.category)).all()
    spent = sum(e.amount for e in expenses)
    rem = max(0.0, budget.monthly_limit - spent)
    pct = (spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0.0

    return BudgetResponse(
        id=budget.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        alert_threshold=budget.alert_threshold,
        spent=round(spent, 2),
        remaining=round(rem, 2),
        percentage=round(pct, 1),
        status="Exceeded" if spent > budget.monthly_limit else ("Warning" if pct >= budget.alert_threshold else "Normal"),
    )


@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully", "id": budget_id}
