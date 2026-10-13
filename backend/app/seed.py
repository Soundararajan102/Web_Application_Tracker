import json
from datetime import date
from sqlalchemy.orm import Session
from .models import Income, Expense, Loan, Investment, Budget, RecurringItem, AppSetting
from .database import SessionLocal, Base, engine


def seed_database(force: bool = False):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        if force:
            db.query(Income).delete()
            db.query(Expense).delete()
            db.query(Loan).delete()
            db.query(Investment).delete()
            db.query(Budget).delete()
            db.query(RecurringItem).delete()
            db.query(AppSetting).delete()
            db.commit()

        # Check if already seeded
        if db.query(Income).count() == 0:
            print("Seeding initial Incomes...")
            incomes = [
                Income(date=date(2026, 6, 1), month="Jun", source="Salary", amount=10000.0, payment_mode="Account", notes="June Monthly Salary"),
                Income(date=date(2026, 7, 1), month="Jul", source="Salary", amount=10000.0, payment_mode="Account", notes="July Monthly Salary"),
                Income(date=date(2026, 8, 1), month="Aug", source="Salary", amount=10000.0, payment_mode="Account", notes="August Monthly Salary"),
                Income(date=date(2026, 9, 1), month="Sep", source="Salary", amount=10000.0, payment_mode="Account", notes="September Monthly Salary"),
                Income(date=date(2026, 10, 8), month="Oct", source="Salary", amount=10000.0, payment_mode="Account", notes="October Monthly Salary"),
                Income(date=date(2026, 10, 8), month="Oct", source="Pocket Money", amount=2655.0, payment_mode="Account", notes="Pocket Money"),
                Income(date=date(2026, 10, 8), month="Oct", source="Gifts", amount=1500.0, payment_mode="Cash", notes="Cash Gift"),
            ]
            db.add_all(incomes)

        if db.query(Expense).count() == 0:
            print("Seeding initial Expenses...")
            expenses = [
                Expense(
                    date=date(2026, 10, 9),
                    month="Oct",
                    category="Food",
                    description="Chips",
                    amount=30.0,
                    payment_method="Account",
                    need_or_want="Want",
                    notes="Evening snacks",
                )
            ]
            db.add_all(expenses)

        if db.query(Loan).count() == 0:
            print("Seeding initial Loans...")
            loans = [
                Loan(borrower="Gowthami", date=date(2026, 10, 8), amount_lent=30000.0, amount_repaid=30000.0, status="Paid", notes="Fully cleared"),
                Loan(borrower="Prathap", date=date(2026, 10, 8), amount_lent=8000.0, amount_repaid=0.0, status="Pending", notes="Pending repayment"),
                Loan(borrower="Sachinn", date=date(2026, 10, 8), amount_lent=300.0, amount_repaid=0.0, status="Pending", notes="Short term loan"),
            ]
            db.add_all(loans)

        if db.query(Budget).count() == 0:
            print("Seeding initial Budgets...")
            budgets = [
                Budget(category="Food", monthly_limit=3000.0, alert_threshold=80.0),
                Budget(category="Office", monthly_limit=1500.0, alert_threshold=80.0),
                Budget(category="Recharge", monthly_limit=1000.0, alert_threshold=85.0),
                Budget(category="Others", monthly_limit=2000.0, alert_threshold=80.0),
            ]
            db.add_all(budgets)

        if db.query(RecurringItem).count() == 0:
            print("Seeding Recurring Items...")
            recurring = [
                RecurringItem(
                    title="Monthly Salary",
                    type="income",
                    category="Salary",
                    amount=10000.0,
                    frequency="Monthly",
                    due_day=1,
                    payment_method="Account",
                    is_active=True,
                    notes="Direct bank credit",
                ),
                RecurringItem(
                    title="Mobile Recharge",
                    type="expense",
                    category="Recharge",
                    amount=299.0,
                    frequency="Monthly",
                    due_day=25,
                    payment_method="Account",
                    is_active=True,
                    notes="Unlimited plan",
                ),
                RecurringItem(
                    title="Office Internet / Tools",
                    type="expense",
                    category="Office",
                    amount=799.0,
                    frequency="Monthly",
                    due_day=10,
                    payment_method="Account",
                    is_active=True,
                    notes="Broadband subscription",
                ),
            ]
            db.add_all(recurring)

        # Settings
        default_settings = {
            "expenseCategories": ["Others", "Office", "Recharge", "Food", "Entertainment", "Health", "Shopping"],
            "investmentTypes": ["NPS", "APY", "PPF", "Gold", "Mutual Funds", "Fixed Deposit", "Stocks"],
            "paymentMethods": ["Account", "Cash", "UPI", "Credit Card"],
            "incomeSources": ["Salary", "Pocket Money", "Gifts", "Freelance", "Interest", "Loan Repaid", "Dividends", "Others"],
            "currency": "INR",
            "currencySymbol": "₹",
        }

        for key, val in default_settings.items():
            if not db.query(AppSetting).filter(AppSetting.key == key).first():
                db.add(AppSetting(key=key, value=json.dumps(val)))

        db.commit()
        print("Database seeded successfully with user data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
