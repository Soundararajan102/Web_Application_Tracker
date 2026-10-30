import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import MobileBottomNav from './components/MobileBottomNav';
import DashboardPage from './pages/DashboardPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import LoansPage from './pages/LoansPage';
import BudgetsPage from './pages/BudgetsPage';
import RecurringPage from './pages/RecurringPage';
import InvestmentsPage from './pages/InvestmentsPage';
import ReportsPage from './pages/ReportsPage';
import { getDashboard, createIncome, createExpense, createLoan } from './api/client';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('finflow_theme') || 'dark');
  const [dashboardData, setDashboardData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('expense');

  // Quick Add Form
  const [quickForm, setQuickForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    categoryOrSource: 'Food',
    description: '',
    paymentMode: 'Account',
    needOrWant: 'Need',
    borrower: '',
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('finflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const data = await getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const amt = parseFloat(quickForm.amount);
      if (quickAddType === 'income') {
        await createIncome({
          date: quickForm.date,
          source: quickForm.categoryOrSource || 'Salary',
          description: quickForm.description,
          amount: amt,
          payment_mode: quickForm.paymentMode,
        });
      } else if (quickAddType === 'expense') {
        await createExpense({
          date: quickForm.date,
          category: quickForm.categoryOrSource || 'Food',
          description: quickForm.description,
          amount: amt,
          payment_method: quickForm.paymentMode,
          need_or_want: quickForm.needOrWant,
        });
      } else if (quickAddType === 'loan') {
        await createLoan({
          borrower: quickForm.borrower || 'Friend',
          date: quickForm.date,
          amount_lent: amt,
          amount_repaid: 0,
          status: 'Pending',
          notes: quickForm.description,
        });
      }

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setIsQuickAddOpen(false);
      setQuickForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        categoryOrSource: 'Food',
        description: '',
        paymentMode: 'Account',
        needOrWant: 'Need',
        borrower: '',
      });
      fetchDashboardData();
    } catch (err) {
      alert(`Error saving transaction: ${err.message}`);
    }
  };

  const pendingLoansCount = dashboardData?.pendingLoans?.length || 0;

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { 
          title: 'Personal Financial Intelligence', 
          subtitle: 'Real-time liquidity, cash vs bank breakdown, and 2026 cash flow trends' 
        };
      case 'income':
        return { 
          title: 'Income & Inflows Ledger', 
          subtitle: 'Track salaries, gifts, pocket money, and bank credits' 
        };
      case 'expenses':
        return { 
          title: 'Expenditures & Outflows', 
          subtitle: 'Detailed spending records classified by category and Need vs Want' 
        };
      case 'loans':
        return { 
          title: 'Loans Given & Debt Recovery', 
          subtitle: 'Active borrower balances, repayment histories, and pending debt' 
        };
      case 'budgets':
        return { 
          title: 'Budget Guardrails & Goals', 
          subtitle: 'Category spending caps with warning thresholds' 
        };
      case 'recurring':
        return { 
          title: 'Scheduled Recurring & Subscriptions', 
          subtitle: 'Calendar due dates and one-click transaction payments' 
        };
      case 'investments':
        return { 
          title: 'Wealth & Investment Assets', 
          subtitle: 'NPS, APY, PPF, and Gold portfolio asset valuation' 
        };
      case 'reports':
        return { 
          title: 'Reports & Spreadsheet Backup', 
          subtitle: 'Annual Excel summary mirror, CSV downloads, and JSON restores' 
        };
      default:
        return { title: 'Personal Finance Tracker', subtitle: 'Overview' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-container">
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingLoansCount={pendingLoansCount}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="main-wrapper">
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenAddModal={() => setIsQuickAddOpen(true)}
          onRefresh={fetchDashboardData}
          isRefreshing={isRefreshing}
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="content-canvas">
          {activeTab === 'dashboard' && (
            <DashboardPage
              data={dashboardData}
              onRefresh={fetchDashboardData}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAddModal={() => setIsQuickAddOpen(true)}
            />
          )}

          {activeTab === 'income' && (
            <IncomePage onRefreshDashboard={fetchDashboardData} />
          )}

          {activeTab === 'expenses' && (
            <ExpensesPage onRefreshDashboard={fetchDashboardData} />
          )}

          {activeTab === 'loans' && (
            <LoansPage onRefreshDashboard={fetchDashboardData} />
          )}

          {activeTab === 'budgets' && (
            <BudgetsPage onRefreshDashboard={fetchDashboardData} />
          )}

          {activeTab === 'recurring' && (
            <RecurringPage onRefreshDashboard={fetchDashboardData} />
          )}

          {activeTab === 'investments' && (
            <InvestmentsPage onRefreshDashboard={fetchDashboardData} />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              monthlyTrend={dashboardData?.monthlyTrend}
              onRefreshDashboard={fetchDashboardData}
            />
          )}
        </main>

        {/* Executive Mobile Bottom Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Quick Entry Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Quick Transaction Entry"
      >
        <div className="quick-add-type-toggle">
          {[
            { id: 'expense', label: 'Expense', color: 'btn-primary' },
            { id: 'income', label: 'Income', color: 'btn-success' },
            { id: 'loan', label: 'Loan Given', color: 'btn-secondary' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              className={`btn ${quickAddType === t.id ? t.color : 'btn-ghost'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setQuickAddType(t.id);
                if (t.id === 'income') setQuickForm(f => ({ ...f, categoryOrSource: 'Salary' }));
                if (t.id === 'expense') setQuickForm(f => ({ ...f, categoryOrSource: 'Food' }));
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleQuickAddSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={quickForm.date}
                onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (INR ₹)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                className="form-input mono"
                placeholder="1000"
                value={quickForm.amount}
                onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
                required
              />
            </div>
          </div>

          {quickAddType === 'loan' ? (
            <div className="form-group">
              <label className="form-label">Borrower Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prathap, Sachinn"
                value={quickForm.borrower}
                onChange={(e) => setQuickForm({ ...quickForm, borrower: e.target.value })}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">{quickAddType === 'income' ? 'Income Source' : 'Expense Category'}</label>
              {quickAddType === 'income' ? (
                <select
                  className="form-select"
                  value={quickForm.categoryOrSource}
                  onChange={(e) => setQuickForm({ ...quickForm, categoryOrSource: e.target.value })}
                >
                  <option value="Salary">Salary</option>
                  <option value="Pocket Money">Pocket Money</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Interest">Interest</option>
                  <option value="Dividends">Dividends</option>
                  <option value="Others">Others</option>
                </select>
              ) : (
                <select
                  className="form-select"
                  value={quickForm.categoryOrSource}
                  onChange={(e) => setQuickForm({ ...quickForm, categoryOrSource: e.target.value })}
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Office">Office & Work</option>
                  <option value="Recharge">Mobile & Internet Recharge</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Others">Others</option>
                </select>
              )}
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                value={quickForm.paymentMode}
                onChange={(e) => setQuickForm({ ...quickForm, paymentMode: e.target.value })}
              >
                <option value="Account">Bank Account</option>
                <option value="Cash">Cash on Hand</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            {quickAddType === 'expense' && (
              <div className="form-group">
                <label className="form-label">Classification</label>
                <select
                  className="form-select"
                  value={quickForm.needOrWant}
                  onChange={(e) => setQuickForm({ ...quickForm, needOrWant: e.target.value })}
                >
                  <option value="Need">Need (Essential)</option>
                  <option value="Want">Want (Discretionary)</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Description / Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lunch with team, monthly salary"
              value={quickForm.description}
              onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
            />
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setIsQuickAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
