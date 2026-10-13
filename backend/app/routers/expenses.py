from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Expense
from ..schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    month: Optional[str] = None,
    category: Optional[str] = None,
    need_or_want: Optional[str] = None,
    payment_method: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if month:
        query = query.filter(Expense.month == month)
    if category:
        query = query.filter(Expense.category == category)
    if need_or_want:
        query = query.filter(Expense.need_or_want.ilike(need_or_want))
    if payment_method:
        query = query.filter(Expense.payment_method == payment_method)
    return query.order_by(Expense.date.desc(), Expense.id.desc()).all()


@router.post("", response_model=ExpenseResponse, status_code=201)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    month_val = expense_in.month or expense_in.date.strftime("%b")
    expense = Expense(
        date=expense_in.date,
        month=month_val,
        category=expense_in.category,
        description=expense_in.description,
        amount=expense_in.amount,
        payment_method=expense_in.payment_method,
        need_or_want=expense_in.need_or_want,
        notes=expense_in.notes,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense record not found")
    return exp


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense record not found")

    update_data = expense_in.model_dump(exclude_unset=True)
    if "date" in update_data and update_data["date"] and "month" not in update_data:
        update_data["month"] = update_data["date"].strftime("%b")

    for field, val in update_data.items():
        setattr(exp, field, val)

    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(Expense).filter(Expense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense record not found")
    db.delete(exp)
    db.commit()
    return {"message": "Expense record deleted successfully", "id": expense_id}
