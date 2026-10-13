import React, { useState, useEffect } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../api/client';
import Modal from '../components/Modal';
import { Target, Plus, AlertCircle, CheckCircle, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function BudgetsPage({ onRefreshDashboard }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Food',
    monthly_limit: '',
    alert_threshold: 80,
  });

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createBudget({
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit),
        alert_threshold: parseFloat(formData.alert_threshold || 80),
      });
      setIsAddModalOpen(false);
      setFormData({ category: 'Food', monthly_limit: '', alert_threshold: 80 });
      fetchBudgets();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error setting budget: ${err.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBudget) return;
    try {
      await updateBudget(editingBudget.id, {
        monthly_limit: parseFloat(editingBudget.monthly_limit),
        alert_threshold: parseFloat(editingBudget.alert_threshold),
      });
      setEditingBudget(null);
      fetchBudgets();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error updating budget: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await deleteBudget(id);
      fetchBudgets();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error deleting budget: ${err.message}`);
    }
  };

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const overallPct = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Spending Budgets & Guardrails</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Set category limits to keep expenditures disciplined and receive active threshold alerts
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Set New Budget</span>
        </button>
      </div>

      {/* Aggregate Progress Card */}
      <div className="glass-card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(30, 41, 66, 0.6), rgba(15, 23, 42, 0.8))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Monthly Budget Allocated</div>
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              ₹{totalBudgetLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Spent So Far:</div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: overallPct >= 80 ? 'var(--rose-500)' : 'var(--emerald-400)' }}>
              ₹{totalBudgetSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({overallPct}%)
            </div>
          </div>
        </div>

        <div className="progress-container" style={{ height: '12px' }}>
          <div 
            className={`progress-bar ${overallPct >= 80 ? 'progress-rose' : 'progress-emerald'}`} 
            style={{ width: `${Math.min(100, overallPct)}%` }}
          ></div>
        </div>
      </div>

      {/* Budget Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {budgets.map((b) => {
          const isWarning = b.percentage >= b.alert_threshold;
          const isExceeded = b.spent > b.monthly_limit;

          return (
            <div key={b.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{b.category}</h3>
                  <span className={`status-pill ${isExceeded ? 'status-want' : isWarning ? 'status-pending' : 'status-paid'}`}>
                    {b.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{b.spent.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    limit: <strong className="mono">₹{b.monthly_limit.toLocaleString('en-IN')}</strong>
                  </span>
                </div>

                <div className="progress-container" style={{ height: '8px', marginBottom: '12px' }}>
                  <div 
                    className={`progress-bar ${isExceeded ? 'progress-rose' : isWarning ? 'progress-amber' : 'progress-emerald'}`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  ></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{b.percentage}% consumed</span>
                  <span>₹{b.remaining.toLocaleString('en-IN')} remaining</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingBudget(b)}
                  title="Edit Budget"
                >
                  <Edit2 size={15} />
                </button>
                <button 
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--rose-500)' }}
                  onClick={() => handleDelete(b.id)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Set Category Budget">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="Food">Food</option>
              <option value="Office">Office</option>
              <option value="Recharge">Recharge</option>
              <option value="Others">Others</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Shopping">Shopping</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (INR)</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input mono"
              placeholder="3000"
              value={formData.monthly_limit}
              onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alert Threshold (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              className="form-input"
              value={formData.alert_threshold}
              onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Triggers warning status once spending hits this percentage of your budget
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Set Budget
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal isOpen={Boolean(editingBudget)} onClose={() => setEditingBudget(null)} title={`Edit Budget for ${editingBudget?.category}`}>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Monthly Limit (INR)</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input mono"
              value={editingBudget?.monthly_limit || ''}
              onChange={(e) => setEditingBudget({ ...editingBudget, monthly_limit: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alert Threshold (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              className="form-input"
              value={editingBudget?.alert_threshold || 80}
              onChange={(e) => setEditingBudget({ ...editingBudget, alert_threshold: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditingBudget(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
