import React from 'react';
import { Sun, Moon, PlusCircle, RefreshCw, Calendar } from 'lucide-react';

export default function Navbar({ 
  title, 
  subtitle, 
  theme, 
  toggleTheme, 
  onOpenAddModal, 
  onRefresh, 
  isRefreshing 
}) {
  const todayStr = "13 Oct 2026";

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-title-block">
          <h1>{title}</h1>
          <div className="header-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="header-actions">
        <div 
          className="split-pill" 
          style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
        >
          <Calendar size={14} style={{ color: 'var(--indigo-500)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{todayStr}</span>
        </div>

        <button 
          className="btn btn-ghost" 
          onClick={onRefresh} 
          title="Refresh Data"
          disabled={isRefreshing}
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          <RefreshCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        <button 
          className="btn btn-ghost" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} style={{ color: '#6366f1' }} />}
        </button>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <PlusCircle size={17} />
          <span>Quick Entry</span>
        </button>
      </div>
    </header>
  );
}
