from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Income
from ..schemas import IncomeCreate, IncomeUpdate, IncomeResponse

router = APIRouter(prefix="/api/incomes", tags=["Incomes"])


@router.get("", response_model=List[IncomeResponse])
def get_incomes(
    month: Optional[str] = None,
    source: Optional[str] = None,
    payment_mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Income)
    if month:
        query = query.filter(Income.month == month)
    if source:
        query = query.filter(Income.source.ilike(f"%{source}%"))
    if payment_mode:
        query = query.filter(Income.payment_mode == payment_mode)
    return query.order_by(Income.date.desc(), Income.id.desc()).all()


@router.post("", response_model=IncomeResponse, status_code=201)
def create_income(income_in: IncomeCreate, db: Session = Depends(get_db)):
    # Auto-populate month if omitted
    month_val = income_in.month or income_in.date.strftime("%b")
    income = Income(
        date=income_in.date,
        month=month_val,
        source=income_in.source,
        description=income_in.description,
        amount=income_in.amount,
        payment_mode=income_in.payment_mode,
        notes=income_in.notes,
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.get("/{income_id}", response_model=IncomeResponse)
def get_income(income_id: int, db: Session = Depends(get_db)):
    inc = db.query(Income).filter(Income.id == income_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Income record not found")
    return inc


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(income_id: int, income_in: IncomeUpdate, db: Session = Depends(get_db)):
    inc = db.query(Income).filter(Income.id == income_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Income record not found")

    update_data = income_in.model_dump(exclude_unset=True)
    if "date" in update_data and update_data["date"] and "month" not in update_data:
        update_data["month"] = update_data["date"].strftime("%b")

    for field, val in update_data.items():
        setattr(inc, field, val)

    db.commit()
    db.refresh(inc)
    return inc


@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    inc = db.query(Income).filter(Income.id == income_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Income record not found")
    db.delete(inc)
    db.commit()
    return {"message": "Income record deleted successfully", "id": income_id}
