import React, { useState, useEffect } from 'react';
import { getLoans, createLoan, recordLoanRepayment, deleteLoan } from '../api/client';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import { HandCoins, Plus, CheckCircle, Clock, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function LoansPage({ onRefreshDashboard }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentAmt, setRepaymentAmt] = useState('');
  const [repaymentMode, setRepaymentMode] = useState('Account');

  const [formData, setFormData] = useState({
    borrower: '',
    date: new Date().toISOString().split('T')[0],
    amount_lent: '',
    amount_repaid: 0,
    due_date: '',
    status: 'Pending',
    notes: '',
  });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await getLoans();
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createLoan({
        ...formData,
        amount_lent: parseFloat(formData.amount_lent),
        amount_repaid: parseFloat(formData.amount_repaid || 0),
        due_date: formData.due_date || null,
      });
      setIsAddModalOpen(false);
      setFormData({
        borrower: '',
        date: new Date().toISOString().split('T')[0],
        amount_lent: '',
        amount_repaid: 0,
        due_date: '',
        status: 'Pending',
        notes: '',
      });
      fetchLoans();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error creating loan: ${err.message}`);
    }
  };

  const handleRepayment = async (e) => {
    e.preventDefault();
    if (!selectedLoan || !repaymentAmt) return;
    try {
      await recordLoanRepayment(selectedLoan.id, {
        amount: parseFloat(repaymentAmt),
        payment_mode: repaymentMode,
      });
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
      setSelectedLoan(null);
      setRepaymentAmt('');
      fetchLoans();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error recording repayment: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    try {
      await deleteLoan(id);
      fetchLoans();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error deleting loan: ${err.message}`);
    }
  };

  const totalLent = loans.reduce((sum, l) => sum + (l.amount_lent || 0), 0);
  const totalRepaid = loans.reduce((sum, l) => sum + (l.amount_repaid || 0), 0);
  const totalRemaining = loans.reduce((sum, l) => sum + (l.remaining || 0), 0);
  const recoveryRate = totalLent > 0 ? ((totalRepaid / totalLent) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Top Banner & Quick Action */}
      <div className="page-top-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Loans & Personal Debt Recovery</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track money lent out to friends & associates, logged repayments, and pending collections
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Money Lent</span>
            <HandCoins size={18} style={{ color: 'var(--indigo-500)' }} />
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            ₹{totalLent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across {loans.length} borrowers</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Recovered</span>
            <ArrowDownLeft size={18} style={{ color: 'var(--emerald-400)' }} />
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '6px' }}>
            ₹{totalRepaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', marginTop: '4px' }}>
            {recoveryRate}% Recovery rate
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding Balance</span>
            <Clock size={18} style={{ color: 'var(--amber-500)' }} />
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-500)', marginTop: '6px' }}>
            ₹{totalRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--amber-500)', marginTop: '4px' }}>
            Pending collection
          </div>
        </div>
      </div>

      {/* Loans Cards & Details */}
      <div className="cards-grid" style={{ marginBottom: '30px' }}>
        {loans.map((loan) => {
          const isPaid = loan.status === 'Paid' || loan.remaining <= 0;
          const progressPct = loan.amount_lent > 0 ? Math.min(100, Math.round((loan.amount_repaid / loan.amount_lent) * 100)) : 0;

          return (
            <div key={loan.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{loan.borrower}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lent on {loan.date}</div>
                  </div>
                  <span className={`status-pill ${isPaid ? 'status-paid' : 'status-pending'}`}>
                    {isPaid ? 'Fully Paid' : 'Pending'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '14px 0', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Amount Lent</div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{loan.amount_lent.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Repaid</div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--emerald-400)' }}>
                      ₹{loan.amount_repaid.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Recovery Progress:</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{progressPct}%</span>
                  </div>
                  <div className="progress-container">
                    <div 
                      className={`progress-bar ${isPaid ? 'progress-emerald' : 'progress-amber'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>

                {!isPaid && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Remaining Owed:</span>
                    <span className="mono" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--amber-500)' }}>
                      ₹{loan.remaining.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                {!isPaid ? (
                  <button 
                    className="btn btn-success" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedLoan(loan);
                      setRepaymentAmt(loan.remaining);
                    }}
                  >
                    Record Repayment
                  </button>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-400)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle size={16} /> All cleared
                  </div>
                )}

                <button 
                  className="btn btn-ghost" 
                  style={{ color: 'var(--rose-500)', padding: '8px' }}
                  onClick={() => handleDelete(loan.id)}
                  title="Delete Loan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Repayment Modal */}
      <Modal
        isOpen={Boolean(selectedLoan)}
        onClose={() => setSelectedLoan(null)}
        title={`Record Repayment from ${selectedLoan?.borrower}`}
      >
        <form onSubmit={handleRepayment}>
          <div className="form-group">
            <label className="form-label">Remaining Balance Owed</label>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-500)', marginBottom: '14px' }}>
              ₹{selectedLoan?.remaining?.toLocaleString('en-IN')}
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

          <div className="form-group">
            <label className="form-label">Destination Account</label>
            <select
              className="form-select"
              value={repaymentMode}
              onChange={(e) => setRepaymentMode(e.target.value)}
            >
              <option value="Account">Bank Account</option>
              <option value="Cash">Cash on Hand</option>
            </select>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedLoan(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Save Repayment
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Loan Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Issue / Record Loan Given">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Borrower Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Borrower Name"
              value={formData.borrower}
              onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Date Lent</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount Lent (INR)</label>
              <input
                type="number"
                step="any"
                min="1"
                className="form-input mono"
                placeholder="5000"
                value={formData.amount_lent}
                onChange={(e) => setFormData({ ...formData, amount_lent: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Already Repaid (if any)</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input mono"
                value={formData.amount_repaid}
                onChange={(e) => setFormData({ ...formData, amount_repaid: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Due Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Reason for loan or terms"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Loan Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
