from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from ..database import get_db
from ..models import Income, Expense, Loan, Investment, Budget

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    # 1. Incomes
    incomes = db.query(Income).all()
    total_income_ytd = sum(i.amount for i in incomes)
    cash_income = sum(i.amount for i in incomes if (i.payment_mode or "").lower() == "cash")
    account_income = sum(i.amount for i in incomes if (i.payment_mode or "").lower() != "cash")

    # 2. Expenses
    expenses = db.query(Expense).all()
    total_expense_ytd = sum(e.amount for e in expenses)
    cash_expense = sum(e.amount for e in expenses if (e.payment_method or "").lower() == "cash")
    account_expense = sum(e.amount for e in expenses if (e.payment_method or "").lower() != "cash")

    # 3. Loans
    loans = db.query(Loan).all()
    total_loans_lent = sum(l.amount_lent for l in loans)
    total_loans_repaid = sum(l.amount_repaid for l in loans)
    total_loans_remaining = sum(l.remaining for l in loans)

    # 4. Investments
    investments = db.query(Investment).all()
    total_investments = sum(inv.amount for inv in investments)

    # 5. Liquid Balances
    current_balance = total_income_ytd - total_expense_ytd - total_loans_remaining - total_investments
    cash_balance = cash_income - cash_expense
    account_balance = current_balance - cash_balance

    # 6. Current Month Net Savings
    now = datetime.now()
    current_month_str = now.strftime("%b")
    current_month_num = now.month
    current_year_num = now.year

    current_month_incomes = sum(
        i.amount for i in incomes 
        if i.month == current_month_str or (i.date and i.date.month == current_month_num and i.date.year == current_year_num)
    )
    current_month_expenses = sum(
        e.amount for e in expenses 
        if e.month == current_month_str or (e.date and e.date.month == current_month_num and e.date.year == current_year_num)
    )
    monthly_savings = current_month_incomes - current_month_expenses
    savings_rate = (monthly_savings / current_month_incomes * 100) if current_month_incomes > 0 else 0.0

    # 7. Monthly Summary Trend (Jan - Dec)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_trend = []
    running_balance = 0.0

    for m in months:
        m_inc = sum(i.amount for i in incomes if i.month == m or (i.date and i.date.strftime("%b") == m))
        m_exp = sum(e.amount for e in expenses if e.month == m or (e.date and e.date.strftime("%b") == m))
        m_loans_lent = sum(l.amount_lent for l in loans if l.date and l.date.strftime("%b") == m)
        m_loans_rep = sum(l.amount_repaid for l in loans if l.date and l.date.strftime("%b") == m)
        m_inv = sum(inv.amount for inv in investments if inv.date and inv.date.strftime("%b") == m)
        m_savings = m_inc - m_exp
        m_rate = (m_savings / m_inc) if m_inc > 0 else 0.0

        running_balance += (m_inc + m_loans_rep) - (m_exp + m_loans_lent + m_inv)
        bal = running_balance

        monthly_trend.append({
            "month": m,
            "income": round(m_inc, 2),
            "expenses": round(m_exp, 2),
            "investments": round(m_inv, 2),
            "loansGiven": round(m_loans_lent, 2),
            "loansRepaid": round(m_loans_rep, 2),
            "netSavings": round(m_savings, 2),
            "balance": round(bal, 2),
            "savingsRate": round(m_rate, 3)
        })

    # 8. Category Breakdown
    cat_map = {}
    for e in expenses:
        cat = e.category or "Others"
        cat_map[cat] = cat_map.get(cat, 0.0) + e.amount

    category_breakdown = []
    for cat, amt in cat_map.items():
        pct = (amt / total_expense_ytd * 100) if total_expense_ytd > 0 else 0.0
        count = sum(1 for e in expenses if e.category == cat)
        category_breakdown.append({
            "category": cat,
            "amount": round(amt, 2),
            "percentage": round(pct, 1),
            "count": count
        })

    # 9. Need vs Want
    need_amt = sum(e.amount for e in expenses if (e.need_or_want or "").lower() == "need")
    want_amt = sum(e.amount for e in expenses if (e.need_or_want or "").lower() == "want")
    need_vs_want = {
        "need": round(need_amt, 2),
        "want": round(want_amt, 2),
        "total": round(total_expense_ytd, 2),
        "needPercentage": round((need_amt / total_expense_ytd * 100) if total_expense_ytd > 0 else 0.0, 1),
        "wantPercentage": round((want_amt / total_expense_ytd * 100) if total_expense_ytd > 0 else 0.0, 1),
    }

    # 10. Recent Transactions Feed
    feed = []
    for i in incomes:
        feed.append({
            "id": f"inc-{i.id}",
            "type": "INCOME",
            "title": f"Income: {i.source}",
            "description": f"Income: {i.source} - {i.description or i.notes or ''}",
            "amount": i.amount,
            "date": i.date.isoformat() if i.date else None,
            "category": i.source,
            "payment_method": i.payment_mode,
            "notes": i.notes,
        })
    for e in expenses:
        feed.append({
            "id": f"exp-{e.id}",
            "type": "EXPENSE",
            "title": f"Expense: {e.description or e.category}",
            "description": f"Expense: {e.description or e.category}",
            "amount": e.amount,
            "date": e.date.isoformat() if e.date else None,
            "category": e.category,
            "payment_method": e.payment_method,
            "needOrWant": e.need_or_want,
            "notes": e.notes,
        })
    for l in loans:
        feed.append({
            "id": f"loan-{l.id}",
            "type": "LOAN",
            "title": f"Loan: {l.borrower} ({l.status})",
            "description": f"Loan: {l.borrower} ({l.status})",
            "amount": l.amount_lent,
            "repaid": l.amount_repaid,
            "remaining": l.remaining,
            "date": l.date.isoformat() if l.date else None,
            "category": "Loan Lent",
            "payment_method": "Account",
            "status": l.status,
            "notes": l.notes,
        })

    # Sort descending by date
    feed.sort(key=lambda x: x["date"] or "", reverse=True)
    recent_transactions = feed[:10]

    # 11. Pending Loans Summary
    pending_loans = [
        {
            "id": l.id,
            "borrower": l.borrower,
            "date": l.date.isoformat() if l.date else None,
            "amount_lent": l.amount_lent,
            "amount_repaid": l.amount_repaid,
            "remaining": l.remaining,
            "status": l.status,
            "notes": l.notes,
        }
        for l in loans if l.remaining > 0
    ]

    # 12. Budgets with Spent Comparison
    budgets = db.query(Budget).all()
    budgets_status = []
    for b in budgets:
        spent = sum(e.amount for e in expenses if e.category.lower() == b.category.lower())
        rem = max(0.0, b.monthly_limit - spent)
        pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0.0
        status = "Exceeded" if spent > b.monthly_limit else ("Warning" if pct >= b.alert_threshold else "Normal")
        budgets_status.append({
            "id": b.id,
            "category": b.category,
            "monthlyLimit": b.monthly_limit,
            "spent": round(spent, 2),
            "remaining": round(rem, 2),
            "percentage": round(pct, 1),
            "alertThreshold": b.alert_threshold,
            "status": status,
        })

    return {
        "kpis": {
            "currentBalance": round(current_balance, 2),
            "cashBalance": round(cash_balance, 2),
            "accountBalance": round(account_balance, 2),
            "totalIncomeYTD": round(total_income_ytd, 2),
            "totalExpensesYTD": round(total_expense_ytd, 2),
            "totalLoansGivenRemaining": round(total_loans_remaining, 2),
            "totalInvestments": round(total_investments, 2),
            "monthlySavings": round(monthly_savings, 2),
            "savingsRate": round(savings_rate, 1),
            "totalLoansLent": round(total_loans_lent, 2),
            "totalLoansRepaid": round(total_loans_repaid, 2),
        },
        "monthlyTrend": monthly_trend,
        "categoryBreakdown": category_breakdown,
        "needVsWant": need_vs_want,
        "recentTransactions": recent_transactions,
        "pendingLoans": pending_loans,
        "budgetsStatus": budgets_status,
    }
