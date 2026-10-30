import json
from sqlalchemy.orm import Session
from .models import Income, Expense, Loan, Investment, Budget, RecurringItem, AppSetting
from .database import SessionLocal, Base, engine


def seed_database(force: bool = False):
    """
    Initializes database tables and default configuration settings.
    Does not insert dummy or hardcoded transaction records.
    """
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
            db.commit()

        # Seed standard default application categories and settings if not present
        default_settings = {
            "expenseCategories": ["Food", "Office", "Recharge", "Entertainment", "Health", "Shopping", "Others"],
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
    except Exception as e:
        db.rollback()
        print(f"Error initializing database settings: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
