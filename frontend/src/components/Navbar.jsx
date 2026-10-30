import React from 'react';
import { Sun, Moon, PlusCircle, RefreshCw, Calendar, Menu, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  title, 
  subtitle, 
  theme, 
  toggleTheme, 
  onOpenAddModal, 
  onRefresh, 
  isRefreshing,
  onToggleSidebar
}) {
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="top-header">
      <div className="header-left">
        {onToggleSidebar && (
          <button 
            className="menu-toggle-btn"
            onClick={onToggleSidebar}
            title="Open Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>{title}</h1>
            <span className="status-pill status-paid" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
              <ShieldCheck size={12} /> Live
            </span>
          </div>
          {subtitle && <div className="header-subtitle">{subtitle}</div>}
        </div>
      </div>

      <div className="header-actions">
        <div className="header-date-pill">
          <Calendar size={14} style={{ color: 'var(--indigo-500)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {todayFormatted}
          </span>
        </div>

        <button 
          className="icon-only-btn" 
          onClick={onRefresh} 
          title="Sync & Refresh Database"
          disabled={isRefreshing}
          aria-label="Refresh financial data"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        <button 
          className="icon-only-btn" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle light or dark theme"
        >
          {theme === 'dark' ? (
            <Sun size={17} style={{ color: '#fbbf24' }} />
          ) : (
            <Moon size={17} style={{ color: '#6366f1' }} />
          )}
        </button>

        <button className="btn btn-primary header-quick-btn" onClick={onOpenAddModal}>
          <PlusCircle size={16} />
          <span className="btn-label">Quick Entry</span>
        </button>
      </div>
    </header>
  );
}
