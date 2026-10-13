import React, { useState } from 'react';
import { 
  getExportJsonUrl, 
  getExportCsvUrl, 
  uploadJson, 
  uploadExcel, 
  resetToDefaults 
} from '../api/client';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function ReportsPage({ monthlyTrend, onRefreshDashboard }) {
  const [importStatus, setImportStatus] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImportStatus({ loading: true, message: `Importing ${file.name}...` });
      let res;
      if (type === 'excel') {
        res = await uploadExcel(file);
      } else {
        res = await uploadJson(file);
      }
      setImportStatus({
        success: true,
        message: `${res.message || 'Data imported successfully!'}`,
      });
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      setImportStatus({
        error: true,
        message: `Import failed: ${err.message}`,
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to restore the initial spreadsheet data? Any unsaved edits will be re-initialized.')) return;
    try {
      setIsResetting(true);
      const res = await resetToDefaults();
      alert(res.message);
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Reports, Spreadsheet Summary & Backup</h2>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Annual cash flow performance, CSV/JSON backups, and Excel sheet integration
        </div>
      </div>

      {/* Monthly Summary Sheet Mirror Table */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileSpreadsheet size={18} style={{ color: 'var(--emerald-400)' }} />
              Annual Monthly Performance Breakdown (Excel Mirror)
            </h3>
            <div className="card-subtitle">Exact replicate of your spreadsheet's "Monthly Summary" tab</div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Income</th>
                <th style={{ textAlign: 'right' }}>Expenses</th>
                <th style={{ textAlign: 'right' }}>Investments</th>
                <th style={{ textAlign: 'right' }}>Loans Given</th>
                <th style={{ textAlign: 'right' }}>Loans Repaid</th>
                <th style={{ textAlign: 'right' }}>Net Savings</th>
                <th style={{ textAlign: 'right' }}>Month-End Balance</th>
                <th style={{ textAlign: 'right' }}>Savings %</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend && monthlyTrend.map((m) => {
                const isNonZero = m.income > 0 || m.expenses > 0 || m.loansGiven > 0;
                return (
                  <tr key={m.month} style={{ opacity: isNonZero ? 1 : 0.65 }}>
                    <td style={{ fontWeight: 700 }}>{m.month}</td>
                    <td className="mono" style={{ textAlign: 'right', color: m.income > 0 ? 'var(--emerald-400)' : 'inherit' }}>
                      ₹{m.income.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: m.expenses > 0 ? 'var(--rose-500)' : 'inherit' }}>
                      ₹{m.expenses.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>
                      ₹{m.investments.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: m.loansGiven > 0 ? 'var(--amber-500)' : 'inherit' }}>
                      ₹{m.loansGiven.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: m.loansRepaid > 0 ? 'var(--emerald-400)' : 'inherit' }}>
                      ₹{m.loansRepaid.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700, color: m.netSavings > 0 ? 'var(--emerald-400)' : 'inherit' }}>
                      ₹{m.netSavings.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 800 }}>
                      ₹{m.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {(m.savingsRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export & Import Grid */}
      <div className="grid-2col">
        {/* Export Data */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Download size={18} style={{ color: 'var(--indigo-500)' }} />
                Export & Download
              </h3>
              <div className="card-subtitle">Download your financial records anytime</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a 
              href={getExportJsonUrl()} 
              download
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
            >
              <FileText size={18} style={{ color: '#6366f1' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Complete JSON Database Backup</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Includes all incomes, expenses, loans, budgets & metadata</div>
              </div>
            </a>

            <a 
              href={getExportCsvUrl('expenses')} 
              download
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
            >
              <FileSpreadsheet size={18} style={{ color: '#f43f5e' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Expenses CSV File</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Categorized spending transactions with Need/Want tags</div>
              </div>
            </a>

            <a 
              href={getExportCsvUrl('incomes')} 
              download
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
            >
              <FileSpreadsheet size={18} style={{ color: '#10b981' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Incomes CSV File</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Salaries, pocket money, and gift history</div>
              </div>
            </a>

            <a 
              href={getExportCsvUrl('loans')} 
              download
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
            >
              <FileSpreadsheet size={18} style={{ color: '#f59e0b' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>Loans & Debt CSV File</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Borrower records, amounts lent, and repayment statuses</div>
              </div>
            </a>
          </div>
        </div>

        {/* Import & Sync */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Upload size={18} style={{ color: 'var(--cyan-500)' }} />
                Import & Sync Data
              </h3>
              <div className="card-subtitle">Upload spreadsheet files or restore defaults</div>
            </div>
          </div>

          {importStatus && (
            <div 
              style={{ 
                padding: '12px 16px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '16px',
                background: importStatus.error ? 'var(--rose-bg)' : 'var(--emerald-bg)',
                color: importStatus.error ? 'var(--rose-500)' : 'var(--emerald-400)',
                border: `1px solid ${importStatus.error ? 'var(--rose-border)' : 'var(--emerald-border)'}`,
                fontSize: '0.85rem'
              }}
            >
              {importStatus.message}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>Import Excel Workbook (.xlsx)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Upload your Personal Finance Tracke.xlsx file to parse all sheets into PostgreSQL.
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'excel')}
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>Import JSON Backup</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Restore or merge accounts from a previous FinFlow JSON export.
              </div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'json')}
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid var(--rose-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--rose-500)' }}>Reset to Spreadsheet Defaults</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Resets PostgreSQL tables to seed state</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={handleReset} disabled={isResetting}>
                  <RotateCcw size={15} />
                  <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
