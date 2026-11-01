import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType } from '../../types';
import { formatBDT, formatDate, getTodayString } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { exportTransactionsCSV } from '../../services/storage';

interface Props {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionHistoryView: React.FC<Props> = ({
  transactions,
  onSelectTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = getTodayString();

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // 2. Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // 3. Date Preset
      if (dateFilterPreset === 'today' && tx.date !== todayStr) return false;
      if (dateFilterPreset === 'this-month' && !tx.date.startsWith(todayStr.substring(0, 7))) return false;
      if (dateFilterPreset === 'last-month') {
        const parts = todayStr.split('-');
        const prevMonth = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 2, 1);
        const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
        if (!tx.date.startsWith(prevMonthStr)) return false;
      }
      if (dateFilterPreset === 'custom') {
        if (customStartDate && tx.date < customStartDate) return false;
        if (customEndDate && tx.date > customEndDate) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = tx.title.toLowerCase().includes(q);
        const inNote = tx.note?.toLowerCase().includes(q) || false;
        const inCat = tx.category.toLowerCase().includes(q);
        const inAmount = tx.amount.toString().includes(q);
        const inTravel = tx.travelDetails
          ? `${tx.travelDetails.from} ${tx.travelDetails.to} ${tx.travelDetails.transportType}`.toLowerCase().includes(q)
          : false;
        const inFood = tx.foodDetails
          ? tx.foodDetails.items.some((i) => i.name.toLowerCase().includes(q))
          : false;
        const inShop = tx.shoppingDetails
          ? tx.shoppingDetails.items.some((i) => i.name.toLowerCase().includes(q))
          : false;

        if (!inTitle && !inNote && !inCat && !inAmount && !inTravel && !inFood && !inShop) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    typeFilter,
    categoryFilter,
    dateFilterPreset,
    customStartDate,
    customEndDate,
    searchQuery,
    todayStr,
  ]);

  // Totals for filtered set
  const filteredExpenseTotal = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const filteredIncomeTotal = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit, search, edit, or reverse financial transactions
          </p>
        </div>

        <button
          onClick={() => exportTransactionsCSV(filteredTransactions)}
          className="py-2.5 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          <span>Export {filteredTransactions.length} as CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location, food, operator, note, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expenses Only
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Income Only
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            <option value="travel">Travel</option>
            <option value="food">Food & Dining</option>
            <option value="shopping">Shopping</option>
            <option value="internet">Internet & Recharge</option>
            <option value="other">Other Expense</option>
            <option value="income">Income / Added</option>
          </select>

          {/* Date Presets */}
          <select
            value={dateFilterPreset}
            onChange={(e) => setDateFilterPreset(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {/* Reset Filters */}
          {(typeFilter !== 'all' || categoryFilter !== 'all' || dateFilterPreset !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setCategoryFilter('all');
                setDateFilterPreset('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Custom Date Pickers */}
        {dateFilterPreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        )}

        {/* Filter Summary Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong>{filteredTransactions.length}</strong> transactions
          </span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            {filteredExpenseTotal > 0 && (
              <span className="text-rose-600 dark:text-rose-400">
                Out: -{formatBDT(filteredExpenseTotal)}
              </span>
            )}
            {filteredIncomeTotal > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                In: +{formatBDT(filteredIncomeTotal)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.map((tx) => {
            const isExp = tx.type === 'expense';
            const isDeletingThis = deleteConfirmId === tx.id;

            return (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Regular row view */}
                <div className="flex items-center justify-between gap-3">
                  {/* Category icon & details */}
                  <div
                    onClick={() => onSelectTransaction(tx)}
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <CategoryIcon category={tx.category} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600">
                          {tx.title}
                        </p>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        {tx.time && <span>· {tx.time}</span>}
                        <span className="capitalize">· {tx.category}</span>
                        {tx.note && <span className="hidden sm:inline italic">· "{tx.note}"</span>}
                      </div>
                    </div>
                  </div>

                  {/* Financial amount and actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      onClick={() => onSelectTransaction(tx)}
                      className="text-right cursor-pointer"
                    >
                      <div className={`text-sm sm:text-base font-bold font-mono ${
                        isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isExp ? '-' : '+'}{formatBDT(tx.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {isExp ? 'Debited' : 'Credited'}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        title="Edit transaction"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(tx.id)}
                        title="Delete transaction"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Deletion Confirmation Bar */}
                {isDeletingThis && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <span className="text-rose-700 dark:text-rose-300">
                      Delete "{tx.title}" and reverse its financial impact?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteTransaction(tx.id);
                          setDeleteConfirmId(null);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              No transactions match your current filters or search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
