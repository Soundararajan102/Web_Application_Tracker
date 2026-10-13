import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../utils/chartConfig';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { recordLoanRepayment } from '../api/client';
import confetti from 'canvas-confetti';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  HandCoins, 
  TrendingUp, 
  PiggyBank, 
  Building2, 
  Coins, 
  AlertCircle,
  Clock,
  CheckCircle,
  PlusCircle
} from 'lucide-react';

export default function DashboardPage({ data, onRefresh, onNavigate }) {
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentAmt, setRepaymentAmt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const { kpis, monthlyTrend, categoryBreakdown, needVsWant, recentTransactions, pendingLoans, budgetsStatus } = data;

  // Monthly Chart Configuration
  const trendLabels = monthlyTrend.map(m => m.month);
  const incomeData = monthlyTrend.map(m => m.income);
  const expenseData = monthlyTrend.map(m => m.expenses);

  const barChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income (₹)',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Expenses (₹)',
        data: expenseData,
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderWidth: 1.5,
        borderRadius: 6,
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
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
        },
      },
      tooltip: {
        callbacks: {
          label: (item) => ` ${item.dataset.label}: ₹${item.raw.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#94a3b8',
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  // Category Doughnut Data
  const donutLabels = categoryBreakdown.length > 0 ? categoryBreakdown.map(c => c.category) : ['No Expenses'];
  const donutValues = categoryBreakdown.length > 0 ? categoryBreakdown.map(c => c.amount) : [1];
  const donutColors = [
    '#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6'
  ];

  const donutChartData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: categoryBreakdown.length > 0 ? donutColors.slice(0, donutLabels.length) : ['#334155'],
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
          font: { size: 11, weight: 600 },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (item) => ` ₹${item.raw.toLocaleString('en-IN')}`,
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
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
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

  return (
    <div>
      {/* Liquid Balance Split Banner */}
      <div className="balance-split-card">
        <div className="balance-hero">
          <span className="balance-hero-label">Current Liquid Balance</span>
          <div className="balance-hero-val mono">
            ₹{kpis.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span className="kpi-badge positive">99.8% Savings Rate</span>
            <span>Liquid net worth ready for deployment</span>
          </div>
        </div>

        <div className="split-pill-group">
          <div className="split-pill">
            <div className="split-pill-icon" style={{ background: 'var(--indigo-bg)', color: 'var(--indigo-500)' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div className="split-pill-title">Bank Accounts</div>
              <div className="split-pill-amt mono">
                ₹{kpis.accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="split-pill">
            <div className="split-pill-icon" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>
              <Coins size={20} />
            </div>
            <div>
              <div className="split-pill-title">Cash on Hand</div>
              <div className="split-pill-amt mono">
                ₹{kpis.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <StatCard
          label="Total Income YTD"
          value={kpis.totalIncomeYTD}
          icon={ArrowDownLeft}
          badge="Salary + Pocket + Gifts"
          badgeType="positive"
          subtitle="Jun - Oct Active"
          accentColor="#10b981"
          iconBg="var(--emerald-bg)"
          iconColor="#10b981"
        />

        <StatCard
          label="Total Expenses YTD"
          value={kpis.totalExpensesYTD}
          icon={ArrowUpRight}
          badge="Controlled"
          badgeType="positive"
          subtitle="1 recorded entry"
          accentColor="#6366f1"
          iconBg="var(--indigo-bg)"
          iconColor="#6366f1"
        />

        <StatCard
          label="Pending Loans Lent"
          value={kpis.totalLoansGivenRemaining}
          icon={HandCoins}
          badge={pendingLoans.length > 0 ? `${pendingLoans.length} Pending` : 'All Cleared'}
          badgeType="warning"
          subtitle="Prathap & Sachinn"
          accentColor="#f59e0b"
          iconBg="var(--amber-bg)"
          iconColor="#f59e0b"
        />

        <StatCard
          label="October Net Savings"
          value={kpis.monthlySavings}
          icon={PiggyBank}
          badge={`${kpis.savingsRate}% Rate`}
          badgeType="positive"
          subtitle="High savings margin"
          accentColor="#a855f7"
          iconBg="var(--purple-bg)"
          iconColor="#a855f7"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid-3col">
        {/* Trend Bar Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--emerald-400)' }} />
                Income vs Expense Monthly Trend
              </h2>
              <div className="card-subtitle">5-Month Inflow & Outflow Pattern (Jun - Oct)</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('reports')}>
              Full Sheet View
            </button>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Expenses & Need vs Want */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Coins size={18} style={{ color: '#ec4899' }} />
                Expense Breakdown
              </h2>
              <div className="card-subtitle">Category & Priority Split</div>
            </div>
          </div>
          
          <div style={{ height: '170px', position: 'relative' }}>
            <Doughnut data={donutChartData} options={donutChartOptions} />
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Need vs Want Split:</span>
              <span className="mono" style={{ fontWeight: 700 }}>
                {needVsWant.wantPercentage}% Want (₹{needVsWant.want})
              </span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar progress-rose" 
                style={{ width: `${Math.max(5, needVsWant.wantPercentage)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Loans & Budget Alerts Row */}
      <div className="grid-2col">
        {/* Outstanding Loans to Recover */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <HandCoins size={18} style={{ color: 'var(--amber-500)' }} />
                Outstanding Loans Given
              </h2>
              <div className="card-subtitle">Money owed back to you (₹{kpis.totalLoansGivenRemaining.toLocaleString('en-IN')})</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('loans')}>
              View All Loans
            </button>
          </div>

          {pendingLoans.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--emerald-400)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 8px' }} />
              <div>All lent funds have been fully repaid!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingLoans.map((l) => (
                <div 
                  key={l.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{l.borrower}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Lent: ₹{l.amountLent.toLocaleString('en-IN')} • Repaid: ₹{l.amountRepaid.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: 800, color: 'var(--amber-500)', fontSize: '1.05rem' }}>
                        ₹{l.remaining.toLocaleString('en-IN')}
                      </div>
                      <span className="status-pill status-pending">Pending</span>
                    </div>

                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        setSelectedLoan(l);
                        setRepaymentAmt(l.remaining);
                      }}
                    >
                      Repay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Progress & Guardrails */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <PiggyBank size={18} style={{ color: 'var(--indigo-500)' }} />
                Monthly Budget Guardrails
              </h2>
              <div className="card-subtitle">Spending limits vs actuals</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('budgets')}>
              Manage Budgets
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {budgetsStatus.slice(0, 4).map((b) => (
              <div key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{b.category}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{b.spent}</span>
                    {' '}of ₹{b.monthlyLimit.toLocaleString('en-IN')} ({b.percentage}%)
                  </span>
                </div>
                <div className="progress-container">
                  <div 
                    className={`progress-bar ${b.percentage >= 80 ? 'progress-rose' : 'progress-emerald'}`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Clock size={18} style={{ color: 'var(--cyan-500)' }} />
              Recent Transactions Feed
            </h2>
            <div className="card-subtitle">Latest chronological inflows, outflows, and debt activities</div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Category / Source</th>
                <th>Payment Mode</th>
                <th style={{ textAlign: 'right' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isExpense = tx.type === 'expense';
                return (
                  <tr key={tx.id}>
                    <td className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {tx.date || '—'}
                    </td>
                    <td>
                      <span className={`status-pill ${isIncome ? 'status-paid' : isExpense ? 'status-want' : 'status-pending'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.title}</td>
                    <td>{tx.category || '—'}</td>
                    <td>{tx.paymentMode || 'Account'}</td>
                    <td 
                      className="mono" 
                      style={{ 
                        textAlign: 'right', 
                        fontWeight: 700, 
                        color: isIncome ? 'var(--emerald-400)' : isExpense ? 'var(--rose-500)' : 'var(--amber-500)'
                      }}
                    >
                      {isIncome ? '+' : isExpense ? '-' : '• '}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Repay Modal */}
      <Modal
        isOpen={Boolean(selectedLoan)}
        onClose={() => setSelectedLoan(null)}
        title={`Record Repayment from ${selectedLoan?.borrower}`}
      >
        <form onSubmit={handleQuickRepay}>
          <div className="form-group">
            <label className="form-label">Remaining Balance Owed</label>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-500)', marginBottom: '14px' }}>
              ₹{selectedLoan?.remaining?.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Repayment Amount Received (INR)</label>
            <input
              type="number"
              className="form-input mono"
              value={repaymentAmt}
              onChange={(e) => setRepaymentAmt(e.target.value)}
              step="any"
              max={selectedLoan?.remaining}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
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
