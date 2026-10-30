# FinFlow • Executive Personal Finance Intelligence Suite

A modern, high-performance personal finance tracking and wealth management web application built with **React**, **FastAPI**, and **PostgreSQL (Supabase Cloud)**.

---

## 🌟 Key Features

1. **Executive Wealth Command Center**:
   - **Real-Time Liquidity Breakdown**: Dynamic tracking of total net worth across Bank Accounts and Cash on Hand.
   - **Dynamic Cash Flow Metrics**: Automated calculation of Year-to-Date inflows, outflows, current month savings, and savings rates.
   - **Multi-Asset Allocation**: Visual distribution bar showing capital split across accounts and receivables.

2. **Visual Analytics & Interactive Charts**:
   - **Cash Flow Pattern**: Monthly Inflow vs. Outflow trend bar chart powered by Chart.js.
   - **Expenditure Breakdown**: Category distribution donut chart with real-time percentages.
   - **Disciplined Spending Ratio**: Discretionary vs. essential needs (Need vs. Want) progress analysis.

3. **Loans & Personal Debt Recovery**:
   - Complete borrower ledger with principal amounts lent, logged repayments, and remaining balances.
   - One-click **Record Repayment** modal with instant balance recalculation and celebration feedback.
   - Active borrower status indicators and recovery rate metrics.

4. **Spending Budgets & Guardrails**:
   - Customizable monthly category limits (Food, Utilities, Work, Entertainment, etc.).
   - Visual progress bars with automated warning threshold alerts when approaching budget limits.

5. **Scheduled Inflows & Recurring Bills**:
   - Track scheduled salary inflows, utility bills, and recurring subscriptions.
   - One-click **Log Now** action to instantly post recurring transactions to the live ledger.

6. **Wealth Portfolio & Investment Channels**:
   - Dedicated portfolio tracker for long-term assets: National Pension Scheme (NPS), APY, PPF, Gold, Mutual Funds, and Equities.
   - Real-time tracking of invested principal vs. current portfolio valuation and unrealized gains.

7. **Spreadsheet Mirror, Reports & Data Portability**:
   - Annual performance breakdown table mirroring classic spreadsheet summary sheets.
   - Complete JSON database backup and restore.
   - CSV export for Expenses, Incomes, and Loans.
   - Direct Excel (`.xlsx`) sheet importer for bulk data migration.

8. **Executive Fintech UI & Dual Themes**:
   - Obsidian Dark Mode with glassmorphic cards and glowing status accents.
   - Clean, minimalist Light Mode with instant toggle in the header.
   - 100% mobile-responsive layout with bottom navigation bar and slide-out navigation drawer.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Chart.js, Lucide Icons, Canvas Confetti | Modern, responsive client UI with micro-interactions |
| **Backend** | FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn | High-throughput asynchronous REST API |
| **Database** | PostgreSQL / Supabase Cloud | Scalable relational database with connection pooling |
| **Data Tools** | OpenPyXL, Pandas | Excel workbook parsing and CSV exports |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL database (or free [Supabase](https://supabase.com/) project)

---

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Configure your database connection URL:
```env
# PostgreSQL / Supabase Connection String
DATABASE_URL=postgresql://postgres:your-password@your-db-host:5432/postgres?sslmode=require

# Application Settings
APP_ENV=development
PORT=8000
HOST=127.0.0.1
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

### 3. Backend Setup (FastAPI)
```bash
# Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt

# Run the API server from project root
cd ..
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Server**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Interactive API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 4. Frontend Setup (React + Vite)
```bash
# In a new terminal, navigate to the frontend directory
cd frontend
npm install
npm run dev
```
* **Web Application**: [http://localhost:5173/](http://localhost:5173/)

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── routers/          # REST API endpoints (dashboard, incomes, expenses, loans, etc.)
│   │   ├── database.py       # SQLAlchemy engine and session pooler
│   │   ├── models.py         # PostgreSQL database schemas
│   │   ├── schemas.py        # Pydantic request/response validators
│   │   └── seed.py           # Database initial setup and default categories
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, Sidebar, Modal, MobileBottomNav, StatCard)
│   │   ├── pages/            # Feature pages (Dashboard, Income, Expenses, Loans, Budgets, etc.)
│   │   ├── api/              # Axios API client functions
│   │   └── index.css         # Executive fintech design system & theme tokens
│   ├── index.html            # Application entry template
│   └── package.json          # Node dependencies and build scripts
├── .env.example              # Root environment template
├── .gitignore                # Comprehensive Git exclusion rules
└── README.md                 # Project documentation
```

---

## 🔒 Security Best Practices
- **No hardcoded credentials**: All database connection strings, passwords, and API tokens are loaded exclusively from local environment variables.
- **Git protection**: Sensitive files (`.env`, `backend/.env`, logs, and temporary caches) are excluded from version control via `.gitignore`.
