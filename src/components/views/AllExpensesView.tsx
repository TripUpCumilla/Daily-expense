import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Filter,
  Calendar,
  Search,
  ArrowUpRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatBDT, formatDate, getTodayString } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { CategoryIcon } from '../common/CategoryIcon';

interface Props {
  allTransactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const AllExpensesView: React.FC<Props> = ({
  allTransactions,
  onSelectTransaction,
}) => {
  const [filterPreset, setFilterPreset] = useState<string>('this-month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [search, setSearch] = useState('');

  const todayStr = getTodayString();

  // Helper date calculations
  const filteredExpenses = useMemo(() => {
    const expensesOnly = allTransactions.filter((t) => t.type === 'expense');

    return expensesOnly.filter((t) => {
      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Presets
      if (filterPreset === 'today') {
        if (t.date !== todayStr) return false;
      } else if (filterPreset === 'yesterday') {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        if (t.date !== yStr) return false;
      } else if (filterPreset === 'this-week') {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const startStr = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
        if (t.date < startStr || t.date > todayStr) return false;
      } else if (filterPreset === 'this-month') {
        if (!t.date.startsWith(todayStr.substring(0, 7))) return false;
      } else if (filterPreset === 'last-month') {
        const parts = todayStr.split('-');
        const prevMonth = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 2, 1);
        const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
        if (!t.date.startsWith(prevMonthStr)) return false;
      } else if (filterPreset === 'custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q) &&
          !t.amount.toString().includes(q) &&
          !(t.note && t.note.toLowerCase().includes(q))
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allTransactions, filterPreset, categoryFilter, customStart, customEnd, search, todayStr]);

  // Aggregate category sums
  const categorySums: Record<string, number> = {
    travel: 0,
    food: 0,
    shopping: 0,
    internet: 0,
    other: 0,
  };

  let totalExpenseSum = 0;
  filteredExpenses.forEach((t) => {
    const amt = Number(t.amount) || 0;
    totalExpenseSum += amt;
    if (categorySums[t.category] !== undefined) {
      categorySums[t.category] += amt;
    } else {
      categorySums.other = (categorySums.other || 0) + amt;
    }
  });

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            All Expenses Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated expense portal with time-period filters and category sums
          </p>
        </div>

        <div className="p-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            Filtered Spend Total:
          </span>
          <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatBDT(totalExpenseSum)}
          </span>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {[
          { id: 'today', label: 'Today' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'this-week', label: 'This Week' },
          { id: 'this-month', label: 'This Month' },
          { id: 'last-month', label: 'Last Month' },
          { id: 'custom', label: 'Custom Range' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterPreset(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              filterPreset === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers */}
      {filterPreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Start Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">End Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>
      )}

      {/* Category Wise Spending Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(['travel', 'food', 'shopping', 'internet', 'other'] as const).map((cat) => {
          const meta = EXPENSE_CATEGORIES[cat];
          const sum = categorySums[cat] || 0;
          const isSelected = categoryFilter === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(isSelected ? 'all' : cat)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <CategoryIcon category={cat} size="sm" />
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {totalExpenseSum > 0 ? Math.round((sum / totalExpenseSum) * 100) : 0}%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {meta.label}
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatBDT(sum)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input & Active Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm"
          />
        </div>

        {categoryFilter !== 'all' && (
          <button
            onClick={() => setCategoryFilter('all')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 shrink-0"
          >
            Clear {categoryFilter} filter
          </button>
        )}
      </div>

      {/* Expense List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Matching Expenses ({filteredExpenses.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Click transaction to view details
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredExpenses.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={tx.category} size="md" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                    {tx.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDate(tx.date)} {tx.time ? `· ${tx.time}` : ''} · {tx.category}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
                  -{formatBDT(tx.amount)}
                </div>
              </div>
            </div>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No expense items found matching your current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
