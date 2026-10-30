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
  ShieldCheck,
  Sun,
  Moon
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
      title: 'Spreadsheets',
      items: [
        { id: 'reports', label: 'Excel Summary Mirror', icon: FileSpreadsheet },
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand & Close */}
      <div className="sidebar-header">
        <a href="#dashboard" className="brand-badge" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
          <div className="brand-icon">
            <span style={{ fontWeight: 900, fontSize: '1.25rem' }}>₹</span>
          </div>
          <div>
            <div className="brand-title">FinFlow</div>
            <div className="brand-tag">Executive Suite</div>
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
        <div className="user-avatar">V</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-meta-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Personal Vault
          </div>
          <div className="user-meta-tag">FinFlow Cloud</div>
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
                  <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info & Theme Control */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-indicator"></span>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>PostgreSQL Live</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Spreadsheet Sync</div>
          </div>
        </div>

        {toggleTheme && (
          <button 
            className="icon-only-btn" 
            style={{ width: '34px', height: '34px' }}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={16} style={{ color: '#fbbf24' }} />
            ) : (
              <Moon size={16} style={{ color: '#6366f1' }} />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
