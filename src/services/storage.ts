import { Transaction, UserSettings } from '../types';
import { getTodayString, getCurrentTimeString } from '../utils/formatters';

const TRANSACTIONS_KEY = 'my_expense_tracker_transactions_v2';
const SETTINGS_KEY = 'my_expense_tracker_settings_v1';

// Purge any legacy v1 demo data from user's browser
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('my_expense_tracker_transactions_v1');
  }
} catch {
  // ignore in SSR
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: 'usr_main_bdt',
  name: 'Sadman Sakib',
  email: 'sakib@dhaka.fintech',
  currency: 'BDT',
  monthlyBudget: 35000,
  categoryBudgets: {
    travel: 6000,
    food: 12000,
    shopping: 10000,
    internet: 2000,
    other: 5000,
  },
  lowBalanceThreshold: 5000,
  allowOverdraft: false,
  hideBalance: false,
  theme: 'light',
  supabaseConfig: {
    url: '',
    anonKey: '',
    connected: false,
  },
};

// All mock and demo data removed - fresh slate starting from today
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// In-memory cache & listeners for immediate UI sync
type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export function subscribeStorage(callback: StorageListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

export function getTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Error reading transactions from localStorage:', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    notifyListeners();
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp' | 'userId'>): Transaction {
  const existing = getTransactions();
  const settings = getUserSettings();
  
  const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date(`${transaction.date}T${transaction.time || '12:00'}:00`).getTime() || Date.now();
  
  const newTx: Transaction = {
    ...transaction,
    id,
    userId: settings.id,
    timestamp,
  };

  const updated = [newTx, ...existing];
  saveTransactions(updated);
  return newTx;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const existing = getTransactions();
  const index = existing.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = existing[index];
  const updatedTx: Transaction = {
    ...current,
    ...updates,
    timestamp: updates.date && updates.time 
      ? new Date(`${updates.date}T${updates.time}:00`).getTime() 
      : current.timestamp,
  };

  existing[index] = updatedTx;
  saveTransactions([...existing]);
  return updatedTx;
}

export function deleteTransaction(id: string): boolean {
  const existing = getTransactions();
  const filtered = existing.filter((t) => t.id !== id);
  if (filtered.length === existing.length) return false;
  saveTransactions(filtered);
  return true;
}

export function getUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_USER_SETTINGS));
      return DEFAULT_USER_SETTINGS;
    }
    return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading settings:', e);
    return DEFAULT_USER_SETTINGS;
  }
}

export function updateUserSettings(updates: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const merged: UserSettings = { ...current, ...updates };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    notifyListeners();
  } catch (e) {
    console.error('Error saving settings:', e);
  }
  return merged;
}

export function resetToDefaultData(): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_USER_SETTINGS));
  notifyListeners();
}

const DEBTS_KEY = 'my_expense_tracker_debts_v1';

export function getDebts(): import('../types').DebtRecord[] {
  try {
    const raw = localStorage.getItem(DEBTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading debts:', e);
    return [];
  }
}

export function saveDebts(debts: import('../types').DebtRecord[]): void {
  try {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
    notifyListeners();
  } catch (e) {
    console.error('Error saving debts:', e);
  }
}

export function addDebt(
  debt: Omit<import('../types').DebtRecord, 'id' | 'createdAt' | 'status'>,
  autoCreateTransaction = true
): import('../types').DebtRecord {
  const existing = getDebts();
  const id = `debt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newDebt: import('../types').DebtRecord = {
    ...debt,
    id,
    status: 'pending',
    createdAt: Date.now(),
  };

  // If autoCreateTransaction is true, automatically record the financial balance movement
  if (autoCreateTransaction) {
    if (debt.type === 'lent') {
      // Money given to someone -> Expense (deducts from balance)
      const tx = addTransaction({
        type: 'expense',
        category: 'loan',
        title: `Money Lent to ${debt.personName} (ধার দিয়েছি)`,
        amount: debt.amount,
        date: debt.date || getTodayString(),
        time: getCurrentTimeString(),
        note: debt.note || (debt.dueDate ? `Expected return: ${debt.dueDate}` : undefined),
        loanDetails: {
          debtId: id,
          personName: debt.personName,
          loanType: 'lent',
        },
      });
      newDebt.transactionId = tx.id;
    } else {
      // Money borrowed from someone -> Income (credits available balance)
      const tx = addTransaction({
        type: 'income',
        category: 'income',
        title: `Money Borrowed from ${debt.personName} (ধার নিয়েছি)`,
        amount: debt.amount,
        date: debt.date || getTodayString(),
        time: getCurrentTimeString(),
        note: debt.note || (debt.dueDate ? `Payable by: ${debt.dueDate}` : undefined),
        incomeDetails: {
          source: 'Loan Borrowed (ধার নেওয়া)',
        },
        loanDetails: {
          debtId: id,
          personName: debt.personName,
          loanType: 'borrowed',
        },
      });
      newDebt.transactionId = tx.id;
    }
  }

  saveDebts([newDebt, ...existing]);
  return newDebt;
}

export function settleDebt(debtId: string): boolean {
  const existing = getDebts();
  const index = existing.findIndex((d) => d.id === debtId);
  if (index === -1) return false;

  const debt = existing[index];
  if (debt.status === 'settled') return true;

  const today = getTodayString();
  const time = getCurrentTimeString();

  // Create reverse settlement transaction
  if (debt.type === 'lent') {
    // Money I lent is now returned to me -> Income (+ to available balance)
    addTransaction({
      type: 'income',
      category: 'income',
      title: `Loan Returned by ${debt.personName} (ধার ফেরত পেয়েছি)`,
      amount: debt.amount,
      date: today,
      time,
      note: `Settled loan given on ${debt.date}`,
      incomeDetails: {
        source: 'Loan Returned (ধার ফেরত পাওয়া)',
      },
      loanDetails: {
        debtId: debt.id,
        personName: debt.personName,
        loanType: 'returned',
      },
    });
  } else {
    // Money I borrowed is now repaid by me -> Expense (- from available balance)
    addTransaction({
      type: 'expense',
      category: 'loan',
      title: `Loan Repaid to ${debt.personName} (দেনা শোধ করেছি)`,
      amount: debt.amount,
      date: today,
      time,
      note: `Repaid debt taken on ${debt.date}`,
      loanDetails: {
        debtId: debt.id,
        personName: debt.personName,
        loanType: 'repaid',
      },
    });
  }

  existing[index] = {
    ...debt,
    status: 'settled',
    settledDate: today,
  };

  saveDebts([...existing]);
  return true;
}

export function deleteDebt(debtId: string): boolean {
  const existing = getDebts();
  const filtered = existing.filter((d) => d.id !== debtId);
  if (filtered.length === existing.length) return false;
  saveDebts(filtered);
  return true;
}

export function clearAllTransactions(): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  localStorage.setItem(DEBTS_KEY, JSON.stringify([]));
  notifyListeners();
}

/**
 * Core Financial Statistics Calculation Engine
 */
export function calculateFinancials(transactions: Transaction[], targetMonthStr?: string) {
  const todayStr = getTodayString();
  const activeMonthStr = targetMonthStr || todayStr.substring(0, 7); // e.g. "2026-11"

  let totalAllTimeIncome = 0;
  let totalAllTimeExpense = 0;

  let totalMonthIncome = 0;
  let totalMonthExpense = 0;

  let totalTodayExpense = 0;
  let totalTodayIncome = 0;

  let openingBalance = 0;

  const categoryTotals: Record<string, number> = {
    travel: 0,
    food: 0,
    shopping: 0,
    internet: 0,
    loan: 0,
    other: 0,
  };

  const debts = getDebts();
  let totalLentPending = 0; // আমি পাব (Receivables)
  let totalBorrowedPending = 0; // আমার দেনা (Payables)

  debts.forEach((d) => {
    if (d.status === 'pending') {
      if (d.type === 'lent') {
        totalLentPending += Number(d.amount) || 0;
      } else {
        totalBorrowedPending += Number(d.amount) || 0;
      }
    }
  });

  const monthTransactions: Transaction[] = [];

  // Sort descending by date & time
  const sorted = [...transactions].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.time || '').localeCompare(a.time || '');
  });

  for (const t of sorted) {
    const amt = Number(t.amount) || 0;
    const tMonth = t.date.substring(0, 7);

    // All-time balance computation
    if (t.type === 'income') {
      totalAllTimeIncome += amt;
    } else {
      totalAllTimeExpense += amt;
    }

    // Opening Balance for selected month = income before month - expense before month
    if (tMonth < activeMonthStr) {
      if (t.type === 'income') {
        openingBalance += amt;
      } else {
        openingBalance -= amt;
      }
    }

    // Target month calculations
    if (tMonth === activeMonthStr) {
      monthTransactions.push(t);
      if (t.type === 'income') {
        totalMonthIncome += amt;
      } else {
        totalMonthExpense += amt;
        if (categoryTotals[t.category] !== undefined) {
          categoryTotals[t.category] += amt;
        } else {
          categoryTotals.other = (categoryTotals.other || 0) + amt;
        }
      }
    }

    // Today calculations
    if (t.date === todayStr) {
      if (t.type === 'expense') {
        totalTodayExpense += amt;
      } else {
        totalTodayIncome += amt;
      }
    }
  }

  const availableBalance = totalAllTimeIncome - totalAllTimeExpense;
  const monthlySavings = totalMonthIncome - totalMonthExpense;
  const closingBalance = openingBalance + totalMonthIncome - totalMonthExpense;

  // Find highest category
  let highestCategory: { name: string; amount: number } | null = null;
  let maxCatAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxCatAmount) {
      maxCatAmount = amt;
      highestCategory = { name: cat, amount: amt };
    }
  }

  // Find most expensive single transaction in month
  let mostExpensiveTransaction: Transaction | null = null;
  for (const t of monthTransactions) {
    if (t.type === 'expense') {
      if (!mostExpensiveTransaction || t.amount > mostExpensiveTransaction.amount) {
        mostExpensiveTransaction = t;
      }
    }
  }

  // Calculate days in month elapsed
  const [yStr, mStr] = activeMonthStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // If target month is current month, average is based on days elapsed so far, else full days
  let divisorDays = daysInMonth;
  if (activeMonthStr === todayStr.substring(0, 7)) {
    divisorDays = Math.max(1, parseInt(todayStr.split('-')[2], 10));
  }
  const averageDailyExpense = Math.round(totalMonthExpense / divisorDays);

  return {
    availableBalance,
    totalMonthIncome,
    totalMonthExpense,
    totalTodayExpense,
    totalTodayIncome,
    monthlySavings,
    openingBalance,
    closingBalance,
    categoryTotals,
    highestCategory,
    mostExpensiveTransaction,
    averageDailyExpense,
    transactionCount: monthTransactions.length,
    monthTransactions,
    allSortedTransactions: sorted,
    activeMonthStr,
    totalLentPending,
    totalBorrowedPending,
    debts,
  };
}

/**
 * Export transactions as CSV (Excel compatible)
 */
export function exportTransactionsCSV(transactions: Transaction[]): void {
  const headers = ['ID', 'Type', 'Category', 'Title', 'Amount (BDT)', 'Date', 'Time', 'Note', 'Details'];
  const rows = transactions.map((t) => {
    let details = '';
    if (t.travelDetails) {
      details = `From: ${t.travelDetails.from} | To: ${t.travelDetails.to} | Transport: ${t.travelDetails.transportType}`;
    } else if (t.foodDetails) {
      details = t.foodDetails.items.map((i) => `${i.name} (${i.quantity || 1}x ৳${i.price})`).join('; ');
    } else if (t.shoppingDetails) {
      details = t.shoppingDetails.items.map((i) => `${i.name} (${i.quantity}x ৳${i.unitPrice} = ৳${i.totalPrice})`).join('; ');
    } else if (t.internetDetails) {
      details = `Type: ${t.internetDetails.rechargeType} | Operator: ${t.internetDetails.operator} ${t.internetDetails.mobileNumber ? '| No: ' + t.internetDetails.mobileNumber : ''}`;
    } else if (t.incomeDetails) {
      details = `Source: ${t.incomeDetails.source}`;
    } else if (t.otherDetails) {
      details = t.otherDetails.expenseName;
    }

    return [
      `"${t.id}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${t.date}"`,
      `"${t.time || ''}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      `"${details.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `My_Expense_Tracker_${getTodayString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export complete backup as JSON
 */
export function exportTransactionsJSON(): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings: getUserSettings(),
    transactions: getTransactions(),
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expense_Tracker_Backup_${getTodayString()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Import backup from JSON
 */
export function importTransactionsJSON(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return { success: false, message: 'Invalid backup file structure: missing transactions array.', count: 0 };
    }

    saveTransactions(data.transactions);
    if (data.settings) {
      updateUserSettings(data.settings);
    }
    return { success: true, message: `Successfully restored ${data.transactions.length} transactions!`, count: data.transactions.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'JSON parse failed';
    return { success: false, message: `Failed to restore: ${msg}`, count: 0 };
  }
}
