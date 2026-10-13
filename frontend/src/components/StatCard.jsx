import React from 'react';

export default function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  badge, 
  badgeType = 'neutral', 
  subtitle, 
  accentColor = 'var(--accent-primary)',
  iconBg,
  iconColor 
}) {
  const formattedVal = typeof value === 'number' 
    ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : value;

  return (
    <div className="glass-card kpi-card" style={{ '--card-accent': accentColor }}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {Icon && (
          <div 
            className="kpi-icon-wrap" 
            style={{ 
              background: iconBg || 'var(--indigo-bg)', 
              color: iconColor || 'var(--indigo-500)' 
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="kpi-value mono">{formattedVal}</div>

      {(subtitle || badge) && (
        <div className="kpi-footer">
          {badge && (
            <span className={`kpi-badge ${badgeType}`}>
              {badge}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
