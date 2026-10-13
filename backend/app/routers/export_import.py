import io
import csv
import json
from datetime import datetime, date
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import Response, JSONResponse
from sqlalchemy.orm import Session
import pandas as pd
from ..database import get_db
from ..models import Income, Expense, Loan, Investment, Budget, RecurringItem

router = APIRouter(prefix="/api/data", tags=["Export & Import"])


@router.get("/export/json")
def export_json(db: Session = Depends(get_db)):
    incomes = [
        {
            "id": i.id,
            "date": i.date.isoformat() if i.date else None,
            "month": i.month,
            "source": i.source,
            "description": i.description,
            "amount": i.amount,
            "paymentMode": i.payment_mode,
            "notes": i.notes,
        }
        for i in db.query(Income).all()
    ]

    expenses = [
        {
            "id": e.id,
            "date": e.date.isoformat() if e.date else None,
            "month": e.month,
            "category": e.category,
            "description": e.description,
            "amount": e.amount,
            "paymentMethod": e.payment_method,
            "needOrWant": e.need_or_want,
            "notes": e.notes,
        }
        for e in db.query(Expense).all()
    ]

    loans = [
        {
            "id": l.id,
            "borrower": l.borrower,
            "date": l.date.isoformat() if l.date else None,
            "amountLent": l.amount_lent,
            "amountRepaid": l.amount_repaid,
            "remaining": l.remaining,
            "dueDate": l.due_date.isoformat() if l.due_date else None,
            "status": l.status,
            "notes": l.notes,
        }
        for l in db.query(Loan).all()
    ]

    investments = [
        {
            "id": inv.id,
            "date": inv.date.isoformat() if inv.date else None,
            "investmentType": inv.investment_type,
            "name": inv.name,
            "amount": inv.amount,
            "currentValue": inv.current_value,
            "units": inv.units,
            "status": inv.status,
            "notes": inv.notes,
        }
        for inv in db.query(Investment).all()
    ]

    budgets = [
        {
            "id": b.id,
            "category": b.category,
            "monthlyLimit": b.monthly_limit,
            "alertThreshold": b.alert_threshold,
        }
        for b in db.query(Budget).all()
    ]

    recurring = [
        {
            "id": r.id,
            "title": r.title,
            "type": r.type,
            "category": r.category,
            "amount": r.amount,
            "frequency": r.frequency,
            "dueDay": r.due_day,
            "paymentMethod": r.payment_method,
            "isActive": r.is_active,
            "notes": r.notes,
        }
        for r in db.query(RecurringItem).all()
    ]

    data = {
        "metadata": {
            "title": "Personal Finance Tracker Export",
            "exportedAt": datetime.now().isoformat(),
            "currency": "INR",
            "currencySymbol": "₹",
        },
        "income": incomes,
        "expenses": expenses,
        "loans": loans,
        "investments": investments,
        "budgets": budgets,
        "recurring": recurring,
    }

    content = json.dumps(data, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=finance_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"},
    )


@router.get("/export/csv")
def export_csv(type: str = "expenses", db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)

    if type == "incomes":
        writer.writerow(["ID", "Date", "Month", "Source", "Description", "Amount (INR)", "Payment Mode", "Notes"])
        for i in db.query(Income).order_by(Income.date.asc()).all():
            writer.writerow([i.id, i.date, i.month, i.source, i.description or "", i.amount, i.payment_mode, i.notes or ""])
        filename = f"incomes_{datetime.now().strftime('%Y%m%d')}.csv"
    elif type == "loans":
        writer.writerow(["ID", "Borrower", "Date", "Amount Lent", "Amount Repaid", "Remaining", "Due Date", "Status", "Notes"])
        for l in db.query(Loan).order_by(Loan.date.asc()).all():
            writer.writerow([l.id, l.borrower, l.date, l.amount_lent, l.amount_repaid, l.remaining, l.due_date or "", l.status, l.notes or ""])
        filename = f"loans_{datetime.now().strftime('%Y%m%d')}.csv"
    else:
        writer.writerow(["ID", "Date", "Month", "Category", "Description", "Amount (INR)", "Payment Method", "Need/Want", "Notes"])
        for e in db.query(Expense).order_by(Expense.date.asc()).all():
            writer.writerow([e.id, e.date, e.month, e.category, e.description or "", e.amount, e.payment_method, e.need_or_want, e.notes or ""])
        filename = f"expenses_{datetime.now().strftime('%Y%m%d')}.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/import/json")
async def import_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        data = json.loads(content.decode("utf-8"))

        imported_counts = {"income": 0, "expenses": 0, "loans": 0, "investments": 0}

        if "income" in data and isinstance(data["income"], list):
            for item in data["income"]:
                inc_date = datetime.strptime(item["date"], "%Y-%m-%d").date() if item.get("date") else date.today()
                inc = Income(
                    date=inc_date,
                    month=item.get("month") or inc_date.strftime("%b"),
                    source=item.get("source", "Other"),
                    description=item.get("description"),
                    amount=float(item.get("amount", 0)),
                    payment_mode=item.get("paymentMode", "Account"),
                    notes=item.get("notes"),
                )
                db.add(inc)
                imported_counts["income"] += 1

        if "expenses" in data and isinstance(data["expenses"], list):
            for item in data["expenses"]:
                exp_date = datetime.strptime(item["date"], "%Y-%m-%d").date() if item.get("date") else date.today()
                exp = Expense(
                    date=exp_date,
                    month=item.get("month") or exp_date.strftime("%b"),
                    category=item.get("category", "Others"),
                    description=item.get("description"),
                    amount=float(item.get("amount", 0)),
                    payment_method=item.get("paymentMethod", "Account"),
                    need_or_want=item.get("needOrWant", "Need"),
                    notes=item.get("notes"),
                )
                db.add(exp)
                imported_counts["expenses"] += 1

        if "loans" in data and isinstance(data["loans"], list):
            for item in data["loans"]:
                l_date = datetime.strptime(item["date"], "%Y-%m-%d").date() if item.get("date") else date.today()
                due = datetime.strptime(item["dueDate"], "%Y-%m-%d").date() if item.get("dueDate") else None
                lent = float(item.get("amountLent", 0))
                repaid = float(item.get("amountRepaid", 0))
                loan = Loan(
                    borrower=item.get("borrower", "Unknown"),
                    date=l_date,
                    amount_lent=lent,
                    amount_repaid=repaid,
                    due_date=due,
                    status=item.get("status", "Paid" if repaid >= lent else "Pending"),
                    notes=item.get("notes"),
                )
                db.add(loan)
                imported_counts["loans"] += 1

        db.commit()
        return {"message": "Data imported successfully", "imported": imported_counts}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to import JSON: {str(e)}")


@router.post("/import/excel")
async def import_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        xl = pd.ExcelFile(io.BytesIO(content))

        imported_counts = {"income": 0, "expenses": 0, "loans": 0}

        if "Income" in xl.sheet_names:
            df_inc = pd.read_excel(xl, "Income")
            for _, row in df_inc.iterrows():
                if pd.isna(row.get("Amount")):
                    continue
                d_val = row.get("Date")
                d_obj = d_val.date() if isinstance(d_val, datetime) or hasattr(d_val, "date") else date.today()
                inc = Income(
                    date=d_obj,
                    month=str(row.get("Month", d_obj.strftime("%b"))),
                    source=str(row.get("Source", "Income")),
                    description=str(row.get("Description")) if not pd.isna(row.get("Description")) else None,
                    amount=float(row.get("Amount", 0)),
                    payment_mode=str(row.get("Payment Mode", "Account")),
                    notes=str(row.get("Notes")) if not pd.isna(row.get("Notes")) else None,
                )
                db.add(inc)
                imported_counts["income"] += 1

        if "Expenses" in xl.sheet_names:
            df_exp = pd.read_excel(xl, "Expenses")
            for _, row in df_exp.iterrows():
                if pd.isna(row.get("Amount")):
                    continue
                d_val = row.get("Date")
                d_obj = d_val.date() if isinstance(d_val, datetime) or hasattr(d_val, "date") else date.today()
                exp = Expense(
                    date=d_obj,
                    month=str(row.get("Month", d_obj.strftime("%b"))),
                    category=str(row.get("Category", "Others")),
                    description=str(row.get("Description")) if not pd.isna(row.get("Description")) else None,
                    amount=float(row.get("Amount", 0)),
                    payment_method=str(row.get("Payment Method", "Account")),
                    need_or_want=str(row.get("Need / Want", "Need")),
                    notes=str(row.get("Notes")) if not pd.isna(row.get("Notes")) else None,
                )
                db.add(exp)
                imported_counts["expenses"] += 1

        if "Loans" in xl.sheet_names:
            df_loans = pd.read_excel(xl, "Loans")
            for _, row in df_loans.iterrows():
                if pd.isna(row.get("Amount Lent")):
                    continue
                d_val = row.get("Date")
                d_obj = d_val.date() if isinstance(d_val, datetime) or hasattr(d_val, "date") else date.today()
                lent = float(row.get("Amount Lent", 0))
                repaid = float(row.get("Amount Repaid", 0)) if not pd.isna(row.get("Amount Repaid")) else 0.0
                due_val = row.get("Due Date")
                due_obj = due_val.date() if isinstance(due_val, datetime) or hasattr(due_val, "date") else None
                status = str(row.get("Status", "Paid" if repaid >= lent else "Pending"))
                loan = Loan(
                    borrower=str(row.get("Borrower", "Unknown")),
                    date=d_obj,
                    amount_lent=lent,
                    amount_repaid=repaid,
                    due_date=due_obj,
                    status=status,
                    notes=str(row.get("Notes")) if not pd.isna(row.get("Notes")) else None,
                )
                db.add(loan)
                imported_counts["loans"] += 1

        db.commit()
        return {"message": "Excel data imported successfully", "imported": imported_counts}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to import Excel: {str(e)}")
