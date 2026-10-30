import React from 'react';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  PlusCircle, 
  ArrowUpRight, 
  Menu 
} from 'lucide-react';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenQuickAdd, 
  onToggleSidebar 
}) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button 
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'income' ? 'active' : ''}`}
        onClick={() => setActiveTab('income')}
      >
        <ArrowDownLeft size={20} />
        <span>Inflows</span>
      </button>

      <button 
        className="mobile-nav-action-btn"
        onClick={onOpenQuickAdd}
        title="Quick Entry"
        aria-label="Add transaction"
      >
        <div className="action-btn-inner">
          <PlusCircle size={24} />
        </div>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
        onClick={() => setActiveTab('expenses')}
      >
        <ArrowUpRight size={20} />
        <span>Expenses</span>
      </button>

      <button 
        className="mobile-nav-item"
        onClick={onToggleSidebar}
        aria-label="Open full menu"
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
