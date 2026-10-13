# FinFlow • Executive Personal Finance Tracker

A full-stack, personal finance tracker web application built with **React**, **FastAPI**, and **PostgreSQL**, populated with the financial dataset from `Personal Finance Tracke.xlsx`.

---

## 🌟 Key Features

1. **Executive KPI Dashboard**:
   - **Current Liquid Balance**: ₹45,825.00
   - **Bank Account Balance**: ₹44,325.00
   - **Physical Cash on Hand**: ₹1,500.00
   - **Total Incomes YTD**: ₹54,155.00 (Salaries June–October + Pocket Money + Gifts)
   - **Total Expenses YTD**: ₹30.00 (Food / Want)
   - **Outstanding Loans Given**: ₹8,300.00 (Prathap ₹8,000, Sachinn ₹300)
   - **Current Month Net Savings**: ₹14,125.00 (99.8% savings rate)

2. **Visual Analytics & Interactive Charts**:
   - 5-Month Inflow vs. Outflow trend bar chart (June through October)
   - Expense category breakdown donut chart
   - Discretionary spending vs essential needs breakdown

3. **Loans & Debt Recovery Manager**:
   - Complete borrower ledger with loan amounts, repaid values, and remaining balances
   - 1-click **Record Repayment** with instant recalculation and celebratory confetti
   - Borrower progress tracking (Gowthami: 100% repaid; Prathap: pending; Sachinn: pending)

4. **Budgets & Guardrails**:
   - Monthly category limits (Food ₹3,000, Office ₹1,500, Recharge ₹1,000, Others ₹2,000)
   - Automatic percentage alerts when spending approaches or exceeds thresholds

5. **Recurring Inflows & Scheduled Bills**:
   - Direct schedule tracking for Monthly Salary (Day 1), Mobile Recharge (Day 25), WiFi & Office (Day 10)
   - 1-click **Log Now** action that instantly logs the transaction into your live income/expenses

6. **Investment Channels**:
   - Pre-configured asset channels for NPS, APY, PPF, and Gold

7. **Reports & Data Backup**:
   - Mirror of the Excel "Monthly Summary" annual performance table
   - Full JSON database export and backup restore
   - CSV export for Expenses, Incomes, and Loans
   - Direct Excel (`.xlsx`) sheet importer

8. **Theme Modes**:
   - Default high-tech dark executive fintech aesthetic with glassmorphism
   - Crisp, minimalist light mode with 1-click toggle in the header

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Chart.js, React-ChartJS-2, Lucide React, Canvas Confetti
- **Backend**: FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn, OpenPyXL, Pandas
- **Database**: PostgreSQL (`postgresql://postgres:root@localhost:5432/finance_tracker`)

---

## 🚀 Running the Project

### 1. Backend (FastAPI)
```powershell
# From the project root (d:\Finance Tracke):
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend (React + Vite)
```powershell
# From frontend directory (d:\Finance Tracke\frontend):
cd frontend
npm run dev
```
Application Dashboard: [http://localhost:5173/](http://localhost:5173/)

---

## 📁 Database Seed Data Summary

- **Incomes**:
  - June Salary: ₹10,000.00 (Bank)
  - July Salary: ₹10,000.00 (Bank)
  - August Salary: ₹10,000.00 (Bank)
  - September Salary: ₹10,000.00 (Bank)
  - October Salary: ₹10,000.00 (Bank)
  - October Pocket Money: ₹2,655.00 (Bank)
  - October Gifts: ₹1,500.00 (Cash)
- **Expenses**:
  - October Food (Chips): ₹30.00 (Bank / Want)
- **Loans**:
  - Gowthami: ₹30,000.00 lent, ₹30,000.00 repaid (Status: Paid)
  - Prathap: ₹8,000.00 lent, ₹0.00 repaid (Status: Pending)
  - Sachinn: ₹300.00 lent, ₹0.00 repaid (Status: Pending)
