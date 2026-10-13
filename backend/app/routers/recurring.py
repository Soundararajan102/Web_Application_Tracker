from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models import RecurringItem, Expense, Income
from ..schemas import RecurringCreate, RecurringUpdate, RecurringResponse

router = APIRouter(prefix="/api/recurring", tags=["Recurring Items"])


@router.get("", response_model=List[RecurringResponse])
def get_recurring_items(db: Session = Depends(get_db)):
    return db.query(RecurringItem).order_by(RecurringItem.due_day.asc()).all()


@router.post("", response_model=RecurringResponse, status_code=201)
def create_recurring_item(item_in: RecurringCreate, db: Session = Depends(get_db)):
    item = RecurringItem(
        title=item_in.title,
        type=item_in.type,
        category=item_in.category,
        amount=item_in.amount,
        frequency=item_in.frequency,
        due_day=item_in.due_day,
        payment_method=item_in.payment_method,
        is_active=item_in.is_active,
        notes=item_in.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=RecurringResponse)
def update_recurring_item(item_id: int, item_in: RecurringUpdate, db: Session = Depends(get_db)):
    item = db.query(RecurringItem).filter(RecurringItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Recurring item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)
    return item


@router.post("/{item_id}/pay")
def log_recurring_transaction(item_id: int, db: Session = Depends(get_db)):
    """Log an immediate expense or income transaction from this recurring bill"""
    item = db.query(RecurringItem).filter(RecurringItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Recurring item not found")

    today = date.today()
    month_str = today.strftime("%b")

    if item.type.lower() == "income":
        inc = Income(
            date=today,
            month=month_str,
            source=item.category or item.title,
            description=f"Auto-logged recurring: {item.title}",
            amount=item.amount,
            payment_mode=item.payment_method,
            notes=f"Recurring item ID {item.id}",
        )
        db.add(inc)
    else:
        exp = Expense(
            date=today,
            month=month_str,
            category=item.category,
            description=f"Auto-logged recurring: {item.title}",
            amount=item.amount,
            payment_method=item.payment_method,
            need_or_want="Need",
            notes=f"Recurring item ID {item.id}",
        )
        db.add(exp)

    db.commit()
    return {"message": f"Successfully logged transaction for '{item.title}'", "amount": item.amount}


@router.delete("/{item_id}")
def delete_recurring_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(RecurringItem).filter(RecurringItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Recurring item not found")
    db.delete(item)
    db.commit()
    return {"message": "Recurring item deleted successfully", "id": item_id}
