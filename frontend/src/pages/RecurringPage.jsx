import React, { useState, useEffect } from 'react';
import { getRecurring, createRecurring, payRecurring, deleteRecurring } from '../api/client';
import Modal from '../components/Modal';
import confetti from 'canvas-confetti';
import { Repeat, Plus, Calendar, Check, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function RecurringPage({ onRefreshDashboard }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'expense',
    category: 'Recharge',
    amount: '',
    frequency: 'Monthly',
    due_day: 1,
    payment_method: 'Account',
    is_active: true,
    notes: '',
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getRecurring();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRecurring({
        ...formData,
        amount: parseFloat(formData.amount),
        due_day: parseInt(formData.due_day, 10),
      });
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        type: 'expense',
        category: 'Recharge',
        amount: '',
        frequency: 'Monthly',
        due_day: 1,
        payment_method: 'Account',
        is_active: true,
        notes: '',
      });
      fetchItems();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error creating recurring item: ${err.message}`);
    }
  };

  const handlePayNow = async (item) => {
    try {
      await payRecurring(item.id);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(`Successfully logged ${item.type} transaction of ₹${item.amount} for "${item.title}"!`);
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error logging transaction: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring subscription/bill?')) return;
    try {
      await deleteRecurring(id);
      fetchItems();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="page-top-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recurring Inflows & Scheduled Bills</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Automate monthly salary inflows, subscriptions, utility bills, and one-click execution
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add Recurring Item</span>
        </button>
      </div>

      <div className="cards-grid">
        {items.map((item) => {
          const isIncome = item.type === 'income';

          return (
            <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{item.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.category} • {item.frequency}</div>
                  </div>
                  <span className={`status-pill ${isIncome ? 'status-paid' : 'status-want'}`}>
                    {isIncome ? 'INFLOW' : 'BILL'}
                  </span>
                </div>

                <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: isIncome ? 'var(--emerald-400)' : 'var(--rose-500)', margin: '10px 0' }}>
                  {isIncome ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={15} style={{ color: 'var(--indigo-500)' }} />
                  <span>Scheduled on day <strong>{item.due_day}</strong> of every month</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  className={`btn ${isIncome ? 'btn-success' : 'btn-primary'}`} 
                  style={{ flex: 1 }}
                  onClick={() => handlePayNow(item)}
                >
                  <Check size={16} />
                  <span>{isIncome ? 'Log Inflow Now' : 'Pay & Log Now'}</span>
                </button>

                <button 
                  className="btn btn-ghost" 
                  style={{ color: 'var(--rose-500)', padding: '8px' }}
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Recurring Item">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Netflix, Rent, Monthly Salary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="expense">Expense (Bill / Subscription)</option>
                <option value="income">Income (Salary / Dividend)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Salary, Utilities, Recharge"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Amount (INR)</label>
              <input
                type="number"
                step="any"
                min="1"
                className="form-input mono"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Due Day (1 - 31)</label>
              <input
                type="number"
                min="1"
                max="31"
                className="form-input"
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="Account">Bank Auto-Debit</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI Mandate</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Recurring Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
