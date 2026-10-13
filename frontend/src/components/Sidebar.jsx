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
  Wallet,
  CheckCircle2,
  Database
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, pendingLoansCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: ArrowDownLeft, badgeText: null },
    { id: 'expenses', label: 'Expenses', icon: ArrowUpRight, badgeText: null },
    { 
      id: 'loans', 
      label: 'Loans & Debt', 
      icon: HandCoins, 
      badgeText: pendingLoansCount > 0 ? `${pendingLoansCount} Due` : null 
    },
    { id: 'budgets', label: 'Budgets & Goals', icon: Target },
    { id: 'recurring', label: 'Recurring & Bills', icon: Repeat },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'reports', label: 'Reports & Import', icon: FileSpreadsheet },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a href="#dashboard" className="brand-badge" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon">
            <Wallet size={24} />
          </div>
          <div>
            <div className="brand-title">FinFlow</div>
            <div className="brand-tag">Executive Suite</div>
          </div>
        </a>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Overview & Tracking</div>
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {item.badgeText && <span className="badge">{item.badgeText}</span>}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '14px' }}>Planning & Growth</div>
        {navItems.slice(4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {item.badgeText && <span className="badge">{item.badgeText}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div className="pulse-indicator"></div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Database size={13} style={{ color: 'var(--emerald-400)' }} />
            PostgreSQL Live
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v1.0</span>
      </div>
    </aside>
  );
}
