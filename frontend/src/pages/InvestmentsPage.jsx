import React, { useState, useEffect } from 'react';
import { getInvestments, createInvestment, deleteInvestment } from '../api/client';
import Modal from '../components/Modal';
import { TrendingUp, Plus, Trash2, ShieldCheck, PieChart, Landmark } from 'lucide-react';

export default function InvestmentsPage({ onRefreshDashboard }) {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    investment_type: 'NPS',
    name: '',
    amount: '',
    current_value: '',
    units: '',
    status: 'Active',
    notes: '',
  });

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await getInvestments();
      setInvestments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createInvestment({
        ...formData,
        amount: parseFloat(formData.amount),
        current_value: formData.current_value ? parseFloat(formData.current_value) : parseFloat(formData.amount),
        units: formData.units ? parseFloat(formData.units) : null,
      });
      setIsAddModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        investment_type: 'NPS',
        name: '',
        amount: '',
        current_value: '',
        units: '',
        status: 'Active',
        notes: '',
      });
      fetchInvestments();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error recording investment: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this investment record?')) return;
    try {
      await deleteInvestment(id);
      fetchInvestments();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Error deleting investment: ${err.message}`);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentVal = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
  const overallPnL = totalCurrentVal - totalInvested;

  return (
    <div>
      {/* Top Banner */}
      <div className="page-top-bar">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Investment Portfolio & Wealth Channels</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track long-term wealth assets across NPS, APY, PPF, Physical Gold, and Equities
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Recommended Channels Showcase */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
          Configured Asset Channels from Spreadsheet
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { name: 'NPS (Tier 1 & 2)', desc: 'National Pension Scheme with 80CCD tax benefits', color: '#6366f1' },
            { name: 'APY (Atal Pension)', desc: 'Guaranteed government pension for lifelong security', color: '#10b981' },
            { name: 'PPF (Public Provident)', desc: 'Exempt-Exempt-Exempt risk-free compounding', color: '#f59e0b' },
            { name: 'Digital & Sovereign Gold', desc: 'Inflation hedge and capital preservation', color: '#ec4899' },
          ].map(ch => (
            <div 
              key={ch.name} 
              style={{ 
                padding: '14px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border-subtle)',
                borderLeft: `4px solid ${ch.color}`
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{ch.name}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>{ch.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="kpi-grid" style={{ marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Invested Principal</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px' }}>
            ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Portfolio Value</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-400)', marginTop: '6px' }}>
            ₹{totalCurrentVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Unrealized Gain / Return</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: overallPnL >= 0 ? 'var(--emerald-400)' : 'var(--rose-500)', marginTop: '6px' }}>
            {overallPnL >= 0 ? '+' : ''}₹{overallPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Asset Type</th>
                <th>Asset / Scheme Name</th>
                <th>Units</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Invested Amount</th>
                <th style={{ textAlign: 'right' }}>Current Value</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Loading investments...
                  </td>
                </tr>
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Landmark size={36} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No active investments logged yet</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      As noted in your spreadsheet, you have ₹45,825 liquid funds ready to allocate to NPS, APY, PPF, or Gold!
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setIsAddModalOpen(true)}>
                      <Plus size={16} /> Log First Investment
                    </button>
                  </td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id}>
                    <td className="mono" style={{ fontSize: '0.84rem' }}>{inv.date}</td>
                    <td>
                      <span className="status-pill status-need">{inv.investment_type}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{inv.name}</td>
                    <td className="mono">{inv.units || '—'}</td>
                    <td>
                      <span className="status-pill status-paid">{inv.status}</span>
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                      ₹{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--emerald-400)' }}>
                      ₹{(inv.current_value || inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--rose-500)', padding: '4px' }}
                        onClick={() => handleDelete(inv.id)}
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

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Investment Record">
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
              <label className="form-label">Asset Channel</label>
              <select
                className="form-select"
                value={formData.investment_type}
                onChange={(e) => setFormData({ ...formData, investment_type: e.target.value })}
                required
              >
                <option value="NPS">NPS (National Pension System)</option>
                <option value="APY">APY (Atal Pension Yojana)</option>
                <option value="PPF">PPF (Public Provident Fund)</option>
                <option value="Gold">Gold (Digital / Physical)</option>
                <option value="Mutual Funds">Mutual Funds (SIP / Lumpsum)</option>
                <option value="Stocks">Equities / Stocks</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Investment Name / Scheme</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. HDFC Pension Fund, SBI PPF Account, 24K Gold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Principal Amount (INR)</label>
              <input
                type="number"
                step="any"
                min="1"
                className="form-input mono"
                placeholder="5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Valuation (Optional)</label>
              <input
                type="number"
                step="any"
                min="1"
                className="form-input mono"
                placeholder="5000"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Account number, folio, or maturity date"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Investment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
