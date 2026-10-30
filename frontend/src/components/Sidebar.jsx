import React from 'react';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  HandCoins, 
  Target, 
  Repeat, 
  TrendingUp, 
  FileSpreadsheet, 
  X,
  Server
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  pendingLoansCount = 0,
  isOpen = false,
  onClose,
  theme,
  toggleTheme
}) {
  const navSections = [
    {
      title: 'Core Capital',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'income', label: 'Income & Inflows', icon: ArrowDownLeft },
        { id: 'expenses', label: 'Expenses Ledger', icon: ArrowUpRight },
        { 
          id: 'loans', 
          label: 'Loans & Debt Recovery', 
          icon: HandCoins, 
          badge: pendingLoansCount > 0 ? `${pendingLoansCount} Due` : null 
        },
      ]
    },
    {
      title: 'Planning & Growth',
      items: [
        { id: 'budgets', label: 'Budget Guardrails', icon: Target },
        { id: 'recurring', label: 'Scheduled Bills', icon: Repeat },
        { id: 'investments', label: 'Wealth & Portfolio', icon: TrendingUp },
      ]
    },
    {
      title: 'Data & Reporting',
      items: [
        { id: 'reports', label: 'Excel & Reports', icon: FileSpreadsheet },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand & Close */}
      <div className="sidebar-header">
        <a href="#dashboard" className="brand-badge" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
          <div className="brand-icon">
            <span style={{ fontWeight: 900, fontSize: '1.3rem' }}>₹</span>
          </div>
          <div>
            <div className="brand-title">FinFlow</div>
            <div className="brand-tag">Wealth Intelligence</div>
          </div>
        </a>

        {onClose && (
          <button 
            className="sidebar-close-btn" 
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Vault Identifier */}
      <div className="sidebar-user-card">
        <div className="user-avatar">
          <Server size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-meta-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Personal Vault
          </div>
          <div className="user-meta-tag">
            <span className="pulse-indicator" style={{ width: '5px', height: '5px' }}></span>
            Active Ledger
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        {navSections.map((sec) => (
          <div key={sec.title}>
            <div className="nav-section-title">{sec.title}</div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--emerald-400)' : 'inherit' }} />
                  <span>{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            FinFlow Intelligence
          </div>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--emerald-400)', fontWeight: 700 }}>
          v2.4
        </div>
      </div>
    </aside>
  );
}
