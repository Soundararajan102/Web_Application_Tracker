import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../utils/chartConfig';
import Modal from '../components/Modal';
import { recordLoanRepayment } from '../api/client';
import confetti from 'canvas-confetti';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  HandCoins, 
  TrendingUp, 
  PiggyBank, 
  Building2, 
  Coins, 
  Clock, 
  CheckCircle,
  PlusCircle,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  Zap,
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function DashboardPage({ data, onRefresh, onNavigate, onOpenAddModal }) {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentAmt, setRepaymentAmt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedSearch, setFeedSearch] = useState('');
  const [activeFeedTab, setActiveFeedTab] = useState('ALL');

  const formatINR = (val, minFrac = 0) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { 
      minimumFractionDigits: minFrac, 
      maximumFractionDigits: minFrac 
    });
  };

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
          <Zap size={36} style={{ color: 'var(--emerald-400)' }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Loading Wealth Intelligence...
        </div>
        <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
          Connecting to Supabase Cloud PostgreSQL (Mumbai 🇮🇳)
        </div>
      </div>
    );
  }

  const { kpis = {}, monthlyTrend = [], categoryBreakdown = [], needVsWant = {}, recentTransactions = [], pendingLoans = [] } = data;

  // Asset allocation percentages
  const totalLiquid = kpis.currentBalance || 0;
  const bankPct = totalLiquid > 0 ? Math.round(((kpis.accountBalance || 0) / totalLiquid) * 100) : 50;
  const cashPct = totalLiquid > 0 ? Math.max(0, 100 - bankPct) : 50;

  // Monthly Chart Configuration
  const trendLabels = monthlyTrend.length > 0 ? monthlyTrend.map(m => m.month) : ['Current'];
  const incomeData = monthlyTrend.length > 0 ? monthlyTrend.map(m => m.income) : [kpis.totalIncomeYTD || 0];
  const expenseData = monthlyTrend.length > 0 ? monthlyTrend.map(m => m.expenses) : [kpis.totalExpensesYTD || 0];

  const barChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Inflows (₹)',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.88)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 8,
      },
      {
        label: 'Outflows (₹)',
        data: expenseData,
        backgroundColor: 'rgba(244, 63, 94, 0.88)',
        borderColor: '#f43f5e',
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 700 },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.dataset.label}: ₹${formatINR(item.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: 600 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { 
          color: '#94a3b8',
          font: { family: 'JetBrains Mono' },
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  // Category Doughnut Data
  const donutLabels = categoryBreakdown.length > 0 ? categoryBreakdown.map(c => c.category) : ['No Outflows Recorded'];
  const donutValues = categoryBreakdown.length > 0 ? categoryBreakdown.map(c => c.amount) : [1];
  const donutColors = ['#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

  const donutChartData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: categoryBreakdown.length > 0 ? donutColors.slice(0, donutLabels.length) : ['rgba(255, 255, 255, 0.08)'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (item) => ` ₹${formatINR(item.raw)}`,
        },
      },
    },
    cutout: '72%',
  };

  const handleQuickRepay = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !repaymentAmt) return;
    try {
      setIsSubmitting(true);
      await recordLoanRepayment(selectedLoan.id, {
        amount: parseFloat(repaymentAmt),
        payment_mode: 'Account',
      });
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
      setSelectedLoan(null);
      setRepaymentAmt('');
      onRefresh();
    } catch (err) {
      alert(`Error recording repayment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter recent transactions
  const filteredFeed = (recentTransactions || []).filter(tx => {
    if (activeFeedTab !== 'ALL' && tx.type !== activeFeedTab) {
      return false;
    }
    if (!feedSearch) return true;
    const q = feedSearch.toLowerCase();
    return (
      (tx.description || '').toLowerCase().includes(q) ||
      (tx.type || '').toLowerCase().includes(q) ||
      (tx.date || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* =====================================================================
          1. EXECUTIVE WEALTH COMMAND CENTER (HERO)
          ===================================================================== */}
      <section className="command-center-hero">
        <div className="hero-top-row">
          <div className="hero-status-pill">
            <span className="pulse-indicator"></span>
            <span>Real-Time Cloud Sync • Mumbai 🇮🇳</span>
          </div>

          <div className="hero-period-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} style={{ color: 'var(--emerald-400)' }} />
            <span>Supabase Cloud PostgreSQL</span>
          </div>
        </div>

        <div className="hero-headline">Total Liquid Net Worth</div>

        <div className="hero-big-number mono">
          <span className="currency">₹</span>
          <span>{formatINR(kpis.currentBalance, 0)}</span>
          <span className="cents">.00</span>
        </div>

        <div className="hero-substats">
          <div className="hero-stat-badge" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)', border: '1px solid var(--emerald-border)' }}>
            <TrendingUp size={14} />
            <span>+₹{formatINR(kpis.monthlySavings)} ({kpis.savingsRate || 0}%) Net Savings</span>
          </div>

          <div className="hero-stat-badge" style={{ background: 'var(--amber-bg)', color: 'var(--amber-400)', border: '1px solid var(--amber-border)' }}>
            <Clock size={14} />
            <span>₹{formatINR(kpis.totalLoansGivenRemaining)} Pending in Loans</span>
          </div>
        </div>

        {/* Multi-Asset Allocation Segmented Bar */}
        <div className="asset-alloc-wrap">
          <div className="asset-alloc-labels">
            <span>Asset Distribution</span>
            <span>Bank: {totalLiquid > 0 ? `${bankPct}%` : '₹0'} • Cash: {totalLiquid > 0 ? `${cashPct}%` : '₹0'}</span>
          </div>
          <div className="asset-alloc-bar">
            <div className="alloc-segment bank" style={{ width: `${bankPct}%` }} title={`Bank: ₹${formatINR(kpis.accountBalance)}`} />
            <div className="alloc-segment cash" style={{ width: `${cashPct}%` }} title={`Cash: ₹${formatINR(kpis.cashBalance)}`} />
          </div>
        </div>

        {/* 3 Interactive Sub-Account Cards */}
        <div className="command-subgrid">
          <div className="command-card" onClick={() => onNavigate('income')}>
            <div className="command-card-icon" style={{ background: 'var(--cyan-bg)', color: 'var(--cyan-400)' }}>
              <Building2 size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="command-card-label">Bank Accounts</div>
              <div className="command-card-val mono">₹{formatINR(kpis.accountBalance)}</div>
              <div className="command-card-hint">View Inflows Ledger →</div>
            </div>
          </div>

          <div className="command-card" onClick={() => onNavigate('expenses')}>
            <div className="command-card-icon" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>
              <Coins size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="command-card-label">Cash on Hand</div>
              <div className="command-card-val mono">₹{formatINR(kpis.cashBalance)}</div>
              <div className="command-card-hint">View Expenses Ledger →</div>
            </div>
          </div>

          <div className="command-card" onClick={() => onNavigate('loans')}>
            <div className="command-card-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber-400)' }}>
              <HandCoins size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="command-card-label">Loans Receivable</div>
              <div className="command-card-val mono">₹{formatINR(kpis.totalLoansGivenRemaining)}</div>
              <div className="command-card-hint">Manage Loans →</div>
            </div>
          </div>
        </div>

        {/* Command Center Action Buttons */}
        <div className="command-actions-row">
          {onOpenAddModal && (
            <button className="btn-command primary" onClick={onOpenAddModal}>
              <PlusCircle size={16} />
              <span>Quick Entry</span>
            </button>
          )}

          <button className="btn-command" onClick={() => onNavigate('income')}>
            <ArrowDownLeft size={16} style={{ color: 'var(--emerald-400)' }} />
            <span>Add Income</span>
          </button>

          <button className="btn-command" onClick={() => onNavigate('expenses')}>
            <ArrowUpRight size={16} style={{ color: 'var(--rose-400)' }} />
            <span>Record Expense</span>
          </button>

          <button className="btn-command" onClick={() => onNavigate('loans')}>
            <HandCoins size={16} style={{ color: 'var(--amber-400)' }} />
            <span>Lend Money</span>
          </button>

          <button className="btn-command" onClick={() => onNavigate('reports')}>
            <FileSpreadsheet size={16} style={{ color: 'var(--cyan-400)' }} />
            <span>Reports & Excel</span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          2. 4-CARD BENTO KPI GRID
          ===================================================================== */}
      <section className="kpi-grid">
        <div className="bento-kpi-card" style={{ '--kpi-accent': 'var(--emerald-400)' }}>
          <div className="bento-kpi-top">
            <span className="bento-kpi-label">Total Inflow YTD</span>
            <div className="bento-kpi-icon" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div className="bento-kpi-value mono">₹{formatINR(kpis.totalIncomeYTD)}</div>
          <div className="bento-kpi-footer">
            <span className="status-pill status-paid">{kpis.totalIncomeYTD > 0 ? 'Active Inflow' : 'Zero Inflow'}</span>
            <span>Recorded Inflows</span>
          </div>
        </div>

        <div className="bento-kpi-card" style={{ '--kpi-accent': 'var(--rose-400)' }}>
          <div className="bento-kpi-top">
            <span className="bento-kpi-label">Total Outflow YTD</span>
            <div className="bento-kpi-icon" style={{ background: 'var(--rose-bg)', color: 'var(--rose-400)' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="bento-kpi-value mono">₹{formatINR(kpis.totalExpensesYTD)}</div>
          <div className="bento-kpi-footer">
            <span className="status-pill" style={{ background: 'var(--rose-bg)', color: 'var(--rose-400)', border: '1px solid var(--rose-border)' }}>
              {kpis.totalExpensesYTD > 0 ? 'Tracked' : 'Zero Outflow'}
            </span>
            <span>Outflow Ledger</span>
          </div>
        </div>

        <div className="bento-kpi-card" style={{ '--kpi-accent': 'var(--amber-400)' }}>
          <div className="bento-kpi-top">
            <span className="bento-kpi-label">Active Debt Owed</span>
            <div className="bento-kpi-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber-400)' }}>
              <HandCoins size={20} />
            </div>
          </div>
          <div className="bento-kpi-value mono">₹{formatINR(kpis.totalLoansGivenRemaining)}</div>
          <div className="bento-kpi-footer">
            <span className="status-pill status-pending">{pendingLoans.length > 0 ? `${pendingLoans.length} Due` : 'Cleared'}</span>
            <span>{pendingLoans.length > 0 ? `${pendingLoans.length} Active Borrowers` : 'No Active Loans'}</span>
          </div>
        </div>

        <div className="bento-kpi-card" style={{ '--kpi-accent': 'var(--cyan-400)' }}>
          <div className="bento-kpi-top">
            <span className="bento-kpi-label">Current Month Savings</span>
            <div className="bento-kpi-icon" style={{ background: 'var(--cyan-bg)', color: 'var(--cyan-400)' }}>
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="bento-kpi-value mono">₹{formatINR(kpis.monthlySavings)}</div>
          <div className="bento-kpi-footer">
            <span className="status-pill status-paid">{kpis.savingsRate || 0}% Saved</span>
            <span>Monthly Surplus</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FINANCIAL INTELLIGENCE & CHARTS (GRID 3-COL)
          ===================================================================== */}
      <div className="grid-3col">
        {/* Cash Flow Pattern */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--emerald-400)' }} />
                Cash Flow Pattern (5-Month Trend)
              </h2>
              <div className="card-subtitle">Monthly Inflow vs Outflow Velocity</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('reports')}>
              Sheet View →
            </button>
          </div>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Expenses & Need vs Want Allocation */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Coins size={18} style={{ color: 'var(--emerald-400)' }} />
                Outflow Allocation
              </h2>
              <div className="card-subtitle">Category & Priority Split</div>
            </div>
          </div>
          
          <div style={{ height: '170px', position: 'relative' }}>
            <Doughnut data={donutChartData} options={donutChartOptions} />
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Need vs Want Split:</span>
              <span className="mono" style={{ fontWeight: 800 }}>
                {needVsWant?.wantPct || 0}% Want (₹{formatINR(needVsWant?.wantTotal)})
              </span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar progress-rose" 
                style={{ width: `${Math.max(5, needVsWant?.wantPct || 0)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. LOANS & RECEIVABLES SPOTLIGHT
          ===================================================================== */}
      {pendingLoans && pendingLoans.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <HandCoins size={18} style={{ color: 'var(--amber-400)' }} />
                Outstanding Loans & Receivables
              </h2>
              <div className="card-subtitle">Money lent out to associates awaiting recovery</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('loans')}>
              View All Loans ({pendingLoans.length}) →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {pendingLoans.map((loan) => (
              <div 
                key={loan.id} 
                style={{ 
                  padding: '16px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-surface)', 
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: 'var(--card-bevel)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{loan.borrower}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Lent ₹{formatINR(loan.amount_lent)} • Repaid ₹{formatINR(loan.amount_repaid)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: 800, color: 'var(--amber-400)', fontSize: '1.15rem' }}>
                    ₹{formatINR(loan.remaining)}
                  </div>
                  <button 
                    className="btn btn-success btn-sm" 
                    style={{ marginTop: '4px' }}
                    onClick={() => {
                      setSelectedLoan(loan);
                      setRepaymentAmt(loan.remaining);
                    }}
                  >
                    Repay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          5. REAL-TIME FINTECH TRANSACTIONS FEED
          ===================================================================== */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Clock size={18} style={{ color: 'var(--emerald-400)' }} />
              Chronological Activity Ledger
            </h2>
            <div className="card-subtitle">Real-time inflows, expenditures, and personal loans</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {['ALL', 'INCOME', 'EXPENSE', 'LOAN'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFeedTab(tab)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeFeedTab === tab ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: activeFeedTab === tab ? 'var(--emerald-400)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab === 'ALL' ? 'All' : tab === 'INCOME' ? 'Inflows' : tab === 'EXPENSE' ? 'Outflows' : 'Loans'}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '200px' }}>
              <input
                type="text"
                placeholder="Search ledger..."
                className="form-input"
                value={feedSearch}
                onChange={(e) => setFeedSearch(e.target.value)}
                style={{ paddingLeft: '34px', paddingRight: '12px', height: '36px', fontSize: '0.82rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {filteredFeed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', margin: '10px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--emerald-bg)', color: 'var(--emerald-400)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Inbox size={24} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              No Transactions Recorded Yet
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 18px' }}>
              Your ledger is completely clean and ready. Add your first salary inflow, bill expense, or personal loan to start tracking your wealth.
            </div>
            {onOpenAddModal && (
              <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
                <PlusCircle size={15} />
                <span>Record First Transaction</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeed.slice(0, 10).map((tx, idx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isExpense = tx.type === 'EXPENSE';
                  const isLoan = tx.type === 'LOAN';

                  return (
                    <tr key={`${tx.id || idx}-${tx.type}`}>
                      <td className="mono" style={{ fontSize: '0.82rem' }}>{tx.date}</td>
                      <td>
                        <span className={`status-pill ${isIncome ? 'status-paid' : isExpense ? 'status-want' : 'status-pending'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tx.description}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {tx.payment_method || 'Account'}
                        </span>
                      </td>
                      <td 
                        className="mono" 
                        style={{ 
                          textAlign: 'right', 
                          fontWeight: 800, 
                          color: isIncome ? 'var(--emerald-400)' : isExpense ? 'var(--rose-400)' : 'var(--amber-400)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}₹{formatINR(tx.amount, 2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Repayment Modal */}
      <Modal
        isOpen={Boolean(selectedLoan)}
        onClose={() => setSelectedLoan(null)}
        title={`Repayment from ${selectedLoan?.borrower}`}
      >
        <form onSubmit={handleQuickRepay}>
          <div className="form-group">
            <label className="form-label">Remaining Balance Owed</label>
            <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber-400)' }}>
              ₹{formatINR(selectedLoan?.remaining)}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount Received (INR)</label>
            <input
              type="number"
              step="any"
              max={selectedLoan?.remaining}
              min="1"
              className="form-input mono"
              value={repaymentAmt}
              onChange={(e) => setRepaymentAmt(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedLoan(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Confirm Repayment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
