import React, { useState, useEffect } from 'react';
import { getIncomes, createIncome, deleteIncome } from '../api/client';
import Modal from '../components/Modal';
import { Plus, Trash2, ArrowDownLeft, Filter, Search, Building2, Coins } from 'lucide-react';

export default function IncomePage({ onRefreshDashboard }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Salary',
    description: '',
    amount: '',
    payment_mode: 'Account',
    notes: '',
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMonth) params.month = selectedMonth;
      if (searchSource) params.source = searchSource;
      const data = await getIncomes(params);
      setIncomes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [selectedMonth, searchSource]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createIncome({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setIsAddModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        source: 'Salary',
        description: '',
        amount: '',
        payment_mode: 'Account',
        notes: '',
      });
      fetchIncomes();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error creating income: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    try {
      await deleteIncome(id);
      fetchIncomes();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error deleting income: ${err.message}`);
    }
  };

  const totalFilteredIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const bankIncome = incomes.filter(i => (i.payment_mode || '').toLowerCase() !== 'cash').reduce((sum, i) => sum + i.amount, 0);
  const cashIncome = incomes.filter(i => (i.payment_mode || '').toLowerCase() === 'cash').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      {/* Top Action Bar & Filter */}
      <div className="page-top-bar">
        <div className="filter-group">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search source..."
              className="form-input"
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {['Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-success" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add New Income</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid-2col" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="kpi-icon-wrap" style={{ background: 'var(--emerald-bg)', color: 'var(--emerald-400)' }}>
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Inflow Filtered</div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
              ₹{totalFilteredIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} style={{ color: 'var(--cyan-400)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bank Inflows</div>
              <div className="mono" style={{ fontWeight: 700 }}>₹{bankIncome.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--border-subtle)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={18} style={{ color: 'var(--amber-500)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cash Inflows</div>
              <div className="mono" style={{ fontWeight: 700 }}>₹{cashIncome.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Month</th>
                <th>Source</th>
                <th>Description</th>
                <th>Payment Mode</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Loading income records...
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No income records found for this filter.
                  </td>
                </tr>
              ) : (
                incomes.map((inc) => (
                  <tr key={inc.id}>
                    <td className="mono" style={{ fontSize: '0.84rem' }}>{inc.date}</td>
                    <td>
                      <span className="status-pill status-paid">{inc.month || '—'}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{inc.source}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{inc.description || '—'}</td>
                    <td>
                      <span className="split-pill" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        {inc.payment_mode}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inc.notes || '—'}</td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--emerald-400)' }}>
                      +₹{inc.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--rose-500)', padding: '4px' }}
                        onClick={() => handleDelete(inc.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record New Income">
        <form onSubmit={handleCreate}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Income Source</label>
              <select
                className="form-select"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                required
              >
                <option value="Salary">Salary</option>
                <option value="Pocket Money">Pocket Money</option>
                <option value="Gifts">Gifts</option>
                <option value="Freelance">Freelance</option>
                <option value="Interest">Interest</option>
                <option value="Dividends">Dividends</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Amount (INR)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                className="form-input mono"
                placeholder="10000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
              >
                <option value="Account">Bank Account</option>
                <option value="Cash">Cash on Hand</option>
                <option value="UPI">UPI / Digital Wallet</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. October monthly salary or bonus"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Additional comments or reference id"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Save Income
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
