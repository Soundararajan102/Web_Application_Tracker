from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Investment
from ..schemas import InvestmentCreate, InvestmentUpdate, InvestmentResponse

router = APIRouter(prefix="/api/investments", tags=["Investments"])


@router.get("", response_model=List[InvestmentResponse])
def get_investments(
    investment_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Investment)
    if investment_type:
        query = query.filter(Investment.investment_type == investment_type)
    if status:
        query = query.filter(Investment.status == status)
    return query.order_by(Investment.date.desc(), Investment.id.desc()).all()


@router.post("", response_model=InvestmentResponse, status_code=201)
def create_investment(inv_in: InvestmentCreate, db: Session = Depends(get_db)):
    inv = Investment(
        date=inv_in.date,
        investment_type=inv_in.investment_type,
        name=inv_in.name,
        amount=inv_in.amount,
        current_value=inv_in.current_value or inv_in.amount,
        units=inv_in.units,
        status=inv_in.status,
        notes=inv_in.notes,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.get("/{inv_id}", response_model=InvestmentResponse)
def get_investment(inv_id: int, db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(Investment.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment record not found")
    return inv


@router.put("/{inv_id}", response_model=InvestmentResponse)
def update_investment(inv_id: int, inv_in: InvestmentUpdate, db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(Investment.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment record not found")

    update_data = inv_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(inv, field, val)

    db.commit()
    db.refresh(inv)
    return inv


@router.delete("/{inv_id}")
def delete_investment(inv_id: int, db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(Investment.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investment record not found")
    db.delete(inv)
    db.commit()
    return {"message": "Investment record deleted successfully", "id": inv_id}
