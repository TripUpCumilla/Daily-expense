import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
} from 'lucide-react';
import { Transaction, ViewTab } from '../../types';
import { formatBDT, formatDateWithDay, getTodayString } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface Props {
  allTransactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  setActiveTab: (tab: ViewTab) => void;
}

export const CalendarView: React.FC<Props> = ({
  allTransactions,
  onSelectTransaction,
  setActiveTab,
}) => {
  const todayStr = getTodayString();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)); // Default to Nov 2026 or current
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (10 = November)

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(getTodayString());
  };

  // Group transactions by date
  const txByDate: Record<string, { expenses: number; income: number; items: Transaction[] }> = {};

  allTransactions.forEach((tx) => {
    if (!txByDate[tx.date]) {
      txByDate[tx.date] = { expenses: 0, income: 0, items: [] };
    }
    txByDate[tx.date].items.push(tx);
    if (tx.type === 'expense') {
      txByDate[tx.date].expenses += Number(tx.amount) || 0;
    } else {
      txByDate[tx.date].income += Number(tx.amount) || 0;
    }
  });

  // Selected date data
  const selectedDayData = txByDate[selectedDateStr] || { expenses: 0, income: 0, items: [] };

  // Calculate monthly stats for current view
  let totalMonthCalendarExpense = 0;
  let totalMonthCalendarIncome = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (txByDate[dStr]) {
      totalMonthCalendarExpense += txByDate[dStr].expenses;
      totalMonthCalendarIncome += txByDate[dStr].income;
    }
  }

  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Interactive Financial Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily expense amounts & income indicators for {monthName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold font-mono text-slate-900 dark:text-white whitespace-nowrap min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Month Highlights Pill */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Month's Expenses</span>
          <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatBDT(totalMonthCalendarExpense)}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Month's Inflow</span>
          <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatBDT(totalMonthCalendarIncome)}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Legend</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Expense
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {weekDayNames.map((name, i) => (
            <div
              key={name}
              className={`text-center text-xs font-semibold py-2 ${
                i === 5 || i === 6 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Pre-padding empty boxes */}
          {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-transparent"
            />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dayStr === todayStr;
            const isSelected = dayStr === selectedDateStr;
            const data = txByDate[dayStr];
            const hasExpense = data && data.expenses > 0;
            const hasIncome = data && data.income > 0;

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => setSelectedDateStr(dayStr)}
                className={`h-20 sm:h-24 rounded-2xl p-1.5 sm:p-2 text-left flex flex-col justify-between transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-md ring-2 ring-indigo-500/30'
                    : isToday
                    ? 'border-indigo-300 dark:border-indigo-800 bg-slate-50 dark:bg-slate-800/80'
                    : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {/* Top: Day number + Dots */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Indicators for expense/income */}
                  <div className="flex items-center gap-1">
                    {hasIncome && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Income recorded" />
                    )}
                    {hasExpense && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Expense recorded" />
                    )}
                  </div>
                </div>

                {/* Bottom: Expense Amount */}
                <div className="min-w-0">
                  {hasExpense ? (
                    <div className="font-mono text-[10px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 truncate">
                      {formatBDT(data.expenses, { compact: true })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300 dark:text-slate-600 truncate">
                      No Expense
                    </div>
                  )}

                  {hasIncome && (
                    <div className="font-mono text-[9px] sm:text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                      +{formatBDT(data.income, { compact: true })}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Breakdown Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {formatDateWithDay(selectedDateStr)}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedDayData.items.length} transactions recorded on this date
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 mr-1.5">Daily Expense:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {formatBDT(selectedDayData.expenses)}
              </strong>
            </div>
            {selectedDayData.income > 0 && (
              <div>
                <span className="text-slate-400 mr-1.5">Daily Inflow:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatBDT(selectedDayData.income)}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Transactions on Selected Day */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {selectedDayData.items.map((tx) => {
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
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                      {tx.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {tx.time || '12:00'} {tx.note ? `· ${tx.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs sm:text-sm font-bold font-mono ${
                    isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isExp ? '-' : '+'}{formatBDT(tx.amount)}
                  </div>
                </div>
              </div>
            );
          })}

          {selectedDayData.items.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No expenses or income recorded on {formatDateWithDay(selectedDateStr)}.
            </div>
          )}
        </div>

        {/* Quick Action Button for this day */}
        <div className="pt-2">
          <button
            onClick={() => setActiveTab('add-expense')}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Add Expense For This Date</span>
          </button>
        </div>
      </div>
    </div>
  );
};
