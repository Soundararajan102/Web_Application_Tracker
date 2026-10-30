import React, { useState, useEffect } from 'react';
import { getExpenses, createExpense, deleteExpense } from '../api/client';
import Modal from '../components/Modal';
import { Plus, Trash2, ArrowUpRight, Search, Tag, AlertTriangle } from 'lucide-react';

export default function ExpensesPage({ onRefreshDashboard }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNeedOrWant, setSelectedNeedOrWant] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    description: '',
    amount: '',
    payment_method: 'Account',
    need_or_want: 'Need',
    notes: '',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedNeedOrWant) params.need_or_want = selectedNeedOrWant;
      const data = await getExpenses(params);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, selectedNeedOrWant]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setIsAddModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: 'Food',
        description: '',
        amount: '',
        payment_method: 'Account',
        need_or_want: 'Need',
        notes: '',
      });
      fetchExpenses();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error recording expense: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error deleting expense: ${err.message}`);
    }
  };

  const totalFilteredExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const needSum = expenses.filter(e => (e.need_or_want || '').toLowerCase() === 'need').reduce((sum, e) => sum + e.amount, 0);
  const wantSum = expenses.filter(e => (e.need_or_want || '').toLowerCase() === 'want').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      {/* Top Filter & Actions */}
      <div className="page-top-bar">
        <div className="filter-group">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {['Food', 'Office', 'Recharge', 'Others', 'Entertainment', 'Health', 'Shopping'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedNeedOrWant}
            onChange={(e) => setSelectedNeedOrWant(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Need">Needs Only</option>
            <option value="Want">Wants Only</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Filtered Expenses</div>
          <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--rose-500)', marginTop: '4px' }}>
            ₹{totalFilteredExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Essentials (Need)</span>
            <span className="status-pill status-need">Need</span>
          </div>
          <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
            ₹{needSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Discretionary (Want)</span>
            <span className="status-pill status-want">Want</span>
          </div>
          <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
            ₹{wantSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Month</th>
                <th>Category</th>
                <th>Description</th>
                <th>Classification</th>
                <th>Payment Method</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No expenses found for this criteria.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="mono" style={{ fontSize: '0.84rem' }}>{exp.date}</td>
                    <td>
                      <span className="status-pill" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {exp.month || '—'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{exp.category}</td>
                    <td>{exp.description || '—'}</td>
                    <td>
                      <span className={`status-pill ${(exp.need_or_want || '').toLowerCase() === 'want' ? 'status-want' : 'status-need'}`}>
                        {exp.need_or_want || 'Need'}
                      </span>
                    </td>
                    <td>{exp.payment_method}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.notes || '—'}</td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--rose-500)' }}>
                      -₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--rose-500)', padding: '4px' }}
                        onClick={() => handleDelete(exp.id)}
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

      {/* Add Expense Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Record New Expense">
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
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="Food">Food & Dining</option>
                <option value="Office">Office & Work</option>
                <option value="Recharge">Mobile & Internet Recharge</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health & Fitness</option>
                <option value="Shopping">Shopping</option>
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
                placeholder="30"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Classification (Need vs Want)</label>
              <select
                className="form-select"
                value={formData.need_or_want}
                onChange={(e) => setFormData({ ...formData, need_or_want: e.target.value })}
              >
                <option value="Need">Need (Essential)</option>
                <option value="Want">Want (Discretionary)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Groceries, Coffee, Transport"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="Account">Bank Account</option>
                <option value="Cash">Cash on Hand</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Store name, receipt notes, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
