from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Loan, Income
from ..schemas import LoanCreate, LoanUpdate, LoanRepayment, LoanResponse

router = APIRouter(prefix="/api/loans", tags=["Loans"])


@router.get("", response_model=List[LoanResponse])
def get_loans(
    status: Optional[str] = None,
    borrower: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Loan)
    if status:
        query = query.filter(Loan.status.ilike(status))
    if borrower:
        query = query.filter(Loan.borrower.ilike(f"%{borrower}%"))
    return query.order_by(Loan.date.desc(), Loan.id.desc()).all()


@router.post("", response_model=LoanResponse, status_code=201)
def create_loan(loan_in: LoanCreate, db: Session = Depends(get_db)):
    status_val = "Paid" if loan_in.amount_repaid >= loan_in.amount_lent else "Pending"
    loan = Loan(
        borrower=loan_in.borrower,
        date=loan_in.date,
        amount_lent=loan_in.amount_lent,
        amount_repaid=loan_in.amount_repaid,
        due_date=loan_in.due_date,
        status=loan_in.status if loan_in.status != "Pending" else status_val,
        notes=loan_in.notes,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    return loan


@router.put("/{loan_id}", response_model=LoanResponse)
def update_loan(loan_id: int, loan_in: LoanUpdate, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")

    update_data = loan_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(loan, field, val)

    # Check status
    if (loan.amount_repaid or 0) >= (loan.amount_lent or 0):
        loan.status = "Paid"
    elif loan.status == "Paid" and (loan.amount_repaid or 0) < (loan.amount_lent or 0):
        loan.status = "Pending"

    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/repay", response_model=LoanResponse)
def record_repayment(loan_id: int, repayment: LoanRepayment, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")

    loan.amount_repaid = (loan.amount_repaid or 0.0) + repayment.amount
    if loan.amount_repaid >= loan.amount_lent:
        loan.status = "Paid"

    db.commit()
    db.refresh(loan)
    return loan


@router.delete("/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    db.delete(loan)
    db.commit()
    return {"message": "Loan record deleted successfully", "id": loan_id}
