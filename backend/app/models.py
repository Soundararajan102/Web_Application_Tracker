from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, Text
from .database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, default=date.today)
    month = Column(String(20), nullable=True)
    source = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(50), default="Account")  # Account or Cash
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, default=date.today)
    month = Column(String(20), nullable=True)
    category = Column(String(100), nullable=False)  # Food, Office, Recharge, Others
    description = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Account")  # Account or Cash
    need_or_want = Column(String(20), default="Need")  # Need or Want
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    borrower = Column(String(150), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    amount_lent = Column(Float, nullable=False)
    amount_repaid = Column(Float, default=0.0)
    due_date = Column(Date, nullable=True)
    status = Column(String(50), default="Pending")  # Pending or Paid
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def remaining(self) -> float:
        return max(0.0, (self.amount_lent or 0.0) - (self.amount_repaid or 0.0))


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, default=date.today)
    investment_type = Column(String(100), nullable=False)  # NPS, APY, PPF, Gold, Mutual Fund, Stocks
    name = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False)
    current_value = Column(Float, nullable=True)
    units = Column(Float, nullable=True)
    status = Column(String(50), default="Active")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False, unique=True)
    monthly_limit = Column(Float, nullable=False)
    alert_threshold = Column(Float, default=80.0)  # Alert when >= 80% spent
    created_at = Column(DateTime, default=datetime.utcnow)


class RecurringItem(Base):
    __tablename__ = "recurring_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    type = Column(String(50), default="expense")  # expense or income
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(String(50), default="Monthly")  # Monthly, Weekly, Yearly
    due_day = Column(Integer, default=1)  # 1st of month, etc.
    payment_method = Column(String(50), default="Account")
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
