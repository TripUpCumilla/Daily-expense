import React from 'react';
import {
  Eye,
  EyeOff,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Sparkles,
  Wallet,
  PiggyBank,
  CheckCircle2,
  HandCoins,
} from 'lucide-react';
import { Transaction, UserSettings, ViewTab } from '../../types';
import { formatBDT, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

interface Props {
  financials: ReturnType<typeof import('../../services/storage').calculateFinancials>;
  userSettings: UserSettings;
  onOpenAddMoney: () => void;
  setActiveTab: (tab: ViewTab) => void;
  onToggleHideBalance: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<Props> = ({
  financials,
  userSettings,
  onOpenAddMoney,
  setActiveTab,
  onToggleHideBalance,
  onSelectTransaction,
}) => {
  const {
    availableBalance,
    totalMonthIncome,
    totalMonthExpense,
    totalTodayExpense,
    monthlySavings,
    categoryTotals,
    allSortedTransactions,
  } = financials;

  const budget = userSettings.monthlyBudget || 35000;
  const budgetPercent = Math.min(100, Math.round((totalMonthExpense / budget) * 100));
  const isBudgetExceeded = totalMonthExpense > budget;
  const isBudgetWarning = !isBudgetExceeded && budgetPercent >= 80;
  const isLowBalance = availableBalance <= userSettings.lowBalanceThreshold;

  const recentTransactions = allSortedTransactions.slice(0, 6);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Low Balance Warning Alert */}
      {isLowBalance && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2.5 text-xs">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Low Balance Notice:</strong> Your available balance is down to{' '}
              <strong className="font-mono">{formatBDT(availableBalance)}</strong> (below your warning threshold of {formatBDT(userSettings.lowBalanceThreshold)}).
            </span>
          </div>
          <button
            onClick={onOpenAddMoney}
            className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Add Money
          </button>
        </div>
      )}

      {/* 1. Main Hero Gradient Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-indigo-950/25 border border-indigo-900/50">
        {/* Decorative soft glowing mesh background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-indigo-200 mb-2">
              <Wallet size={15} className="text-indigo-400" />
              <span>Current Available Balance</span>
              <button
                onClick={onToggleHideBalance}
                aria-label={userSettings.hideBalance ? 'Show balance' : 'Hide balance'}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-indigo-200 transition-colors cursor-pointer"
              >
                {userSettings.hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono tracking-tight text-white mb-2">
              {userSettings.hideBalance ? '••••••••' : formatBDT(availableBalance)}
            </div>

            <div className="flex items-center gap-3 text-xs text-indigo-300">
              <span className="inline-flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Live Bangladeshi Taka (৳ BDT)
              </span>
              <span>·</span>
              <span>{userSettings.allowOverdraft ? 'Overdraft Allowed' : 'Strict Balance'}</span>
            </div>
          </div>

          {/* Quick Action Buttons on Balance Card */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddMoney}
              className="py-3 px-4 sm:px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <ArrowDownLeft size={18} strokeWidth={2.5} />
              <span>Add Money</span>
            </button>
            <button
              onClick={() => setActiveTab('add-expense')}
              className="py-3 px-4 sm:px-5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <PlusCircle size={18} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Money Added This Month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Money Added This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatBDT(totalMonthIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total inflows in {financials.activeMonthStr}
          </div>
        </div>

        {/* Total Expenses This Month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Expenses This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatBDT(totalMonthExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {budgetPercent}% of monthly budget
          </div>
        </div>

        {/* Today's Total Expenses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Today's Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">
            {formatBDT(totalTodayExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Recorded since midnight
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Monthly Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PiggyBank size={16} />
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono ${
            monthlySavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatBDT(monthlySavings, { showSign: true })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Income minus Expenses
          </div>
        </div>
      </div>

      {/* 3. Monthly Budget Progress Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Budget Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target monthly limit: <strong className="font-mono">{formatBDT(budget)}</strong>
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {formatBDT(totalMonthExpense)} spent ({budgetPercent}%)
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isBudgetExceeded
                ? 'bg-rose-500'
                : isBudgetWarning
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>0 BDT</span>
          {isBudgetExceeded ? (
            <span className="text-rose-600 font-semibold">Over budget by {formatBDT(totalMonthExpense - budget)}!</span>
          ) : (
            <span>{formatBDT(budget - totalMonthExpense)} remaining</span>
          )}
          <span>{formatBDT(budget)}</span>
        </div>
      </div>

      {/* 4. Category Breakdown Cards Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Category Breakdown This Month
          </h3>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Analytics</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(['travel', 'food', 'shopping', 'internet', 'other'] as const).map((catKey) => {
            const meta = EXPENSE_CATEGORIES[catKey];
            const spent = categoryTotals[catKey] || 0;
            const catBudget = userSettings.categoryBudgets[catKey] || 10000;
            const percent = Math.min(100, Math.round((spent / catBudget) * 100));

            return (
              <div
                key={catKey}
                onClick={() => setActiveTab('all-expenses')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <CategoryIcon category={catKey} size="sm" />
                  <span className="text-[10px] font-semibold text-slate-400">
                    {percent}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                  {meta.label}
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {formatBDT(spent)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Loan & Debt (ধার ও দেনা-পাওনা) Overview Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/40">
            <HandCoins size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Debt & Loan Tracker (ধার ও দেনা-পাওনা)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track money you lent to someone (আমি পাব) and money owed (আমার দেনা)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-2.5 px-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-sans font-semibold">আমি পাব (You'll Get):</span>
            <strong className="text-amber-600 dark:text-amber-400 text-sm">
              {formatBDT(financials.totalLentPending || 0)}
            </strong>
          </div>

          <div className="p-2.5 px-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40">
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 block font-sans font-semibold">আমার দেনা (You Owe):</span>
            <strong className="text-indigo-600 dark:text-indigo-400 text-sm">
              {formatBDT(financials.totalBorrowedPending || 0)}
            </strong>
          </div>

          <button
            onClick={() => setActiveTab('debt')}
            className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Manage Debts</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 6. Recent Transactions List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any item to inspect, edit, or reverse
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({allSortedTransactions.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTransactions.map((tx) => {
            const isExp = tx.type === 'expense';
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={tx.category} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {tx.title}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatDate(tx.date)}</span>
                      {tx.time && <span>· {tx.time}</span>}
                      {tx.note && <span className="hidden sm:inline italic">· "{tx.note}"</span>}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className={`text-xs sm:text-sm font-bold font-mono ${
                    isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isExp ? '-' : '+'}{formatBDT(tx.amount)}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    {tx.category}
                  </div>
                </div>
              </div>
            );
          })}

          {recentTransactions.length === 0 && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold font-mono">
                ৳
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Ready to Start Fresh Today!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  All previous sample expenses and income data have been cleared. Add your opening balance or record your first expense to begin tracking.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={onOpenAddMoney}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  <ArrowDownLeft size={15} />
                  <span>Add Money / Income</span>
                </button>
                <button
                  onClick={() => setActiveTab('add-expense')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer"
                >
                  <PlusCircle size={15} />
                  <span>Add First Expense</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
