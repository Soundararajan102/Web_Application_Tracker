const API_BASE = import.meta.env.VITE_API_URL || '';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// Dashboard
export const getDashboard = () => request('/api/dashboard/overview');

// Incomes
export const getIncomes = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/api/incomes${q ? `?${q}` : ''}`);
};
export const createIncome = (data) => request('/api/incomes', { method: 'POST', body: JSON.stringify(data) });
export const updateIncome = (id, data) => request(`/api/incomes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteIncome = (id) => request(`/api/incomes/${id}`, { method: 'DELETE' });

// Expenses
export const getExpenses = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/api/expenses${q ? `?${q}` : ''}`);
};
export const createExpense = (data) => request('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
export const updateExpense = (id, data) => request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteExpense = (id) => request(`/api/expenses/${id}`, { method: 'DELETE' });

// Loans
export const getLoans = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/api/loans${q ? `?${q}` : ''}`);
};
export const createLoan = (data) => request('/api/loans', { method: 'POST', body: JSON.stringify(data) });
export const recordLoanRepayment = (id, data) => request(`/api/loans/${id}/repay`, { method: 'POST', body: JSON.stringify(data) });
export const updateLoan = (id, data) => request(`/api/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLoan = (id) => request(`/api/loans/${id}`, { method: 'DELETE' });

// Investments
export const getInvestments = () => request('/api/investments');
export const createInvestment = (data) => request('/api/investments', { method: 'POST', body: JSON.stringify(data) });
export const deleteInvestment = (id) => request(`/api/investments/${id}`, { method: 'DELETE' });

// Budgets
export const getBudgets = () => request('/api/budgets');
export const createBudget = (data) => request('/api/budgets', { method: 'POST', body: JSON.stringify(data) });
export const updateBudget = (id, data) => request(`/api/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBudget = (id) => request(`/api/budgets/${id}`, { method: 'DELETE' });

// Recurring
export const getRecurring = () => request('/api/recurring');
export const createRecurring = (data) => request('/api/recurring', { method: 'POST', body: JSON.stringify(data) });
export const payRecurring = (id) => request(`/api/recurring/${id}/pay`, { method: 'POST' });
export const deleteRecurring = (id) => request(`/api/recurring/${id}`, { method: 'DELETE' });

// Settings
export const getSettings = () => request('/api/settings');
export const resetToDefaults = () => request('/api/settings/reset-to-defaults', { method: 'POST' });

// Export / Import
export const getExportJsonUrl = () => `${API_BASE}/api/data/export/json`;
export const getExportCsvUrl = (type) => `${API_BASE}/api/data/export/csv?type=${type}`;

export const uploadJson = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/data/import/json`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to import JSON file');
  return res.json();
};

export const uploadExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/data/import/excel`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to import Excel file');
  return res.json();
};
