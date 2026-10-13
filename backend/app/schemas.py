from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field


# Income Schemas
class IncomeBase(BaseModel):
    date: date
    month: Optional[str] = None
    source: str
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    payment_mode: str = "Account"
    notes: Optional[str] = None


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(BaseModel):
    date: Optional[date] = None
    month: Optional[str] = None
    source: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    payment_mode: Optional[str] = None
    notes: Optional[str] = None


class IncomeResponse(IncomeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseBase(BaseModel):
    date: date
    month: Optional[str] = None
    category: str
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    payment_method: str = "Account"
    need_or_want: str = "Need"
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    date: Optional[date] = None
    month: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    payment_method: Optional[str] = None
    need_or_want: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Loan Schemas
class LoanBase(BaseModel):
    borrower: str
    date: date
    amount_lent: float = Field(..., gt=0)
    amount_repaid: float = 0.0
    due_date: Optional[date] = None
    status: str = "Pending"
    notes: Optional[str] = None


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    borrower: Optional[str] = None
    date: Optional[date] = None
    amount_lent: Optional[float] = None
    amount_repaid: Optional[float] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class LoanRepayment(BaseModel):
    amount: float = Field(..., gt=0)
    payment_mode: str = "Account"
    notes: Optional[str] = None


class LoanResponse(LoanBase):
    id: int
    remaining: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Investment Schemas
class InvestmentBase(BaseModel):
    date: date
    investment_type: str
    name: str
    amount: float = Field(..., gt=0)
    current_value: Optional[float] = None
    units: Optional[float] = None
    status: str = "Active"
    notes: Optional[str] = None


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    date: Optional[date] = None
    investment_type: Optional[str] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    current_value: Optional[float] = None
    units: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class InvestmentResponse(InvestmentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Budget Schemas
class BudgetBase(BaseModel):
    category: str
    monthly_limit: float = Field(..., gt=0)
    alert_threshold: float = 80.0


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = Field(None, gt=0)
    alert_threshold: Optional[float] = None


class BudgetResponse(BudgetBase):
    id: int
    spent: Optional[float] = 0.0
    remaining: Optional[float] = 0.0
    percentage: Optional[float] = 0.0
    status: Optional[str] = "Normal"

    class Config:
        from_attributes = True


# Recurring Items Schemas
class RecurringBase(BaseModel):
    title: str
    type: str = "expense"
    category: str
    amount: float = Field(..., gt=0)
    frequency: str = "Monthly"
    due_day: int = 1
    payment_method: str = "Account"
    is_active: bool = True
    notes: Optional[str] = None


class RecurringCreate(RecurringBase):
    pass


class RecurringUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None
    due_day: Optional[int] = None
    payment_method: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class RecurringResponse(RecurringBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardKPI(BaseModel):
    currentBalance: float
    cashBalance: float
    accountBalance: float
    totalIncomeYTD: float
    totalExpensesYTD: float
    totalLoansGivenRemaining: float
    totalInvestments: float
    monthlySavings: float
    savingsRate: float
    totalLoansLent: float
    totalLoansRepaid: float


class MonthlySummaryItem(BaseModel):
    month: str
    income: float
    expenses: float
    investments: float
    loansGiven: float
    loansRepaid: float
    netSavings: float
    balance: float
    savingsRate: float


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int


class DashboardOverviewResponse(BaseModel):
    kpis: DashboardKPI
    monthlyTrend: List[MonthlySummaryItem]
    categoryBreakdown: List[CategoryBreakdownItem]
    needVsWant: dict
    recentTransactions: List[dict]
    pendingLoans: List[dict]
    budgetsStatus: List[dict]
