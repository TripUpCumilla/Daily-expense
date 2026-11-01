import React, { useState } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, UserSettings } from '../../types';
import { calculateFinancials, exportTransactionsCSV } from '../../services/storage';
import { formatBDT, formatMonthYear, formatDate } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { CategoryIcon } from '../common/CategoryIcon';

interface Props {
  allTransactions: Transaction[];
  userSettings: UserSettings;
}

export const MonthlyReportView: React.FC<Props> = ({ allTransactions, userSettings }) => {
  // Available months extracted from transactions
  const monthSet = new Set<string>();
  monthSet.add('2026-11');
  monthSet.add('2026-10');
  allTransactions.forEach((tx) => {
    if (tx.date) monthSet.add(tx.date.substring(0, 7));
  });
  const availableMonths = Array.from(monthSet).sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '2026-11');
  const [activeChartTab, setActiveChartTab] = useState<'category' | 'daily' | 'compare'>('category');

  // Compute report for selected month
  const report = calculateFinancials(allTransactions, selectedMonth);

  const {
    openingBalance,
    totalMonthIncome,
    totalMonthExpense,
    closingBalance,
    monthlySavings,
    categoryTotals,
    highestCategory,
    mostExpensiveTransaction,
    averageDailyExpense,
    transactionCount,
    monthTransactions,
  } = report;

  // Compute previous month comparison
  const [yearStr, monthNumStr] = selectedMonth.split('-');
  const prevDate = new Date(parseInt(yearStr, 10), parseInt(monthNumStr, 10) - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevReport = calculateFinancials(allTransactions, prevMonthStr);

  const expenseDiff = totalMonthExpense - prevReport.totalMonthExpense;
  const expenseDiffPercent = prevReport.totalMonthExpense > 0
    ? Math.round((expenseDiff / prevReport.totalMonthExpense) * 100)
    : 0;

  // Chart 1: Donut chart calculation
  const totalCatExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const donutSlices = (['travel', 'food', 'shopping', 'internet', 'other'] as const).map((cat) => {
    const amount = categoryTotals[cat] || 0;
    const percentage = totalCatExpenses > 0 ? (amount / totalCatExpenses) * 100 : 0;
    const meta = EXPENSE_CATEGORIES[cat];
    return {
      cat,
      label: meta.label,
      amount,
      percentage,
      color: meta.color,
    };
  });

  // Chart 2: Daily Expenses Bar Chart
  const [yStr, mStr] = selectedMonth.split('-');
  const daysInSelectedMonth = new Date(parseInt(yStr, 10), parseInt(mStr, 10), 0).getDate();
  const dailySpendMap: Record<number, number> = {};
  for (let i = 1; i <= daysInSelectedMonth; i++) dailySpendMap[i] = 0;

  monthTransactions.forEach((t) => {
    if (t.type === 'expense') {
      const day = parseInt(t.date.split('-')[2], 10);
      dailySpendMap[day] = (dailySpendMap[day] || 0) + Number(t.amount);
    }
  });

  const maxDailySpend = Math.max(1, ...Object.values(dailySpendMap));

  // Chart 3: 6 Months comparison data
  const comparisonMonths: Array<{ monthStr: string; label: string; income: number; expense: number }> = [];
  const baseDate = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mRep = calculateFinancials(allTransactions, mKey);
    comparisonMonths.push({
      monthStr: mKey,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      income: mRep.totalMonthIncome,
      expense: mRep.totalMonthExpense,
    });
  }

  const maxCompAmount = Math.max(
    1,
    ...comparisonMonths.map((m) => Math.max(m.income, m.expense))
  );

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Top Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Financial Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accounting period: 1st {formatMonthYear(selectedMonth)} – End of month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-semibold font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthYear(m)}
              </option>
            ))}
          </select>

          {/* Export Actions */}
          <button
            onClick={() => exportTransactionsCSV(monthTransactions)}
            className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            onClick={handlePrintPDF}
            className="py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Printer size={15} />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header (Visible on print) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">My Expense Tracker — Monthly Financial Report</h1>
        <p className="text-sm text-gray-600">
          Period: 1st {formatMonthYear(selectedMonth)} to Last Day of Month · Currency: Bangladeshi Taka (৳ BDT)
        </p>
      </div>

      {/* 1. Accounting Formula & Summary Strip */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-indigo-300">
          <span>Monthly Accounting Equation</span>
          <span className="font-mono text-[11px]">
            Closing = Opening + Income - Expense
          </span>
        </div>

        {/* 5 Equation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* Opening Balance */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-indigo-200 block mb-1">1. Opening Balance</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white">
              {formatBDT(openingBalance)}
            </div>
          </div>

          {/* Total Money Added */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-300 block mb-1">+ Total Money Added</span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
              +{formatBDT(totalMonthIncome)}
            </div>
          </div>

          {/* Total Expenses */}
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[11px] text-rose-300 block mb-1">- Total Money Spent</span>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-400">
              -{formatBDT(totalMonthExpense)}
            </div>
          </div>

          {/* Closing Balance */}
          <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/30">
            <span className="text-[11px] text-indigo-200 block mb-1">= Closing Balance</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white">
              {formatBDT(closingBalance)}
            </div>
          </div>

          {/* Total Savings */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-indigo-200 block mb-1">Net Monthly Savings</span>
            <div className={`text-base sm:text-lg font-bold font-mono ${
              monthlySavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatBDT(monthlySavings, { showSign: true })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Analytics KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Highest Spending Category */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Award size={14} className="text-purple-500" />
            <span>Highest Spending Category</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
            {highestCategory ? EXPENSE_CATEGORIES[highestCategory.name]?.label || highestCategory.name : 'None'}
          </div>
          <div className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
            {highestCategory ? formatBDT(highestCategory.amount) : '৳0'}
          </div>
        </div>

        {/* Most Expensive Single Transaction */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Zap size={14} className="text-rose-500" />
            <span>Most Expensive Transaction</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={mostExpensiveTransaction?.title}>
            {mostExpensiveTransaction ? mostExpensiveTransaction.title : 'None'}
          </div>
          <div className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
            {mostExpensiveTransaction ? formatBDT(mostExpensiveTransaction.amount) : '৳0'}
          </div>
        </div>

        {/* Average Daily Expense */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Calendar size={14} className="text-sky-500" />
            <span>Average Daily Expense</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
            {formatBDT(averageDailyExpense)}
          </div>
          <div className="text-[11px] text-slate-400">
            Per day spending rate
          </div>
        </div>

        {/* Total Number of Transactions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-500" />
            <span>Total Transactions</span>
          </div>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
            {transactionCount}
          </div>
          <div className="text-[11px] text-slate-400">
            Inflows & outflows
          </div>
        </div>
      </div>

      {/* 3. Graphical Reports Section (Charts) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Financial Visualizations & Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive reports and historical breakdowns
            </p>
          </div>

          {/* Chart Segmented Control Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl no-print">
            <button
              onClick={() => setActiveChartTab('category')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeChartTab === 'category'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Category Donut
            </button>
            <button
              onClick={() => setActiveChartTab('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeChartTab === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daily Bar Chart
            </button>
            <button
              onClick={() => setActiveChartTab('compare')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeChartTab === 'compare'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              6-Month Trend
            </button>
          </div>
        </div>

        {/* View A: Category Donut & Breakdown Table */}
        {activeChartTab === 'category' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* SVG Donut */}
            <div className="md:col-span-5 flex flex-col items-center justify-center py-4">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="14"
                  />
                  {/* Segment arcs */}
                  {(() => {
                    let cumulativePercentage = 0;
                    return donutSlices.map((slice) => {
                      if (slice.percentage <= 0) return null;
                      const strokeDasharray = `${slice.percentage * 2.513} 251.3`;
                      const strokeDashoffset = -(cumulativePercentage * 2.513);
                      cumulativePercentage += slice.percentage;

                      return (
                        <circle
                          key={slice.cat}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Center text in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Total Spent
                  </span>
                  <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {formatBDT(totalCatExpenses, { compact: true })}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {monthTransactions.filter((t) => t.type === 'expense').length} items
                  </span>
                </div>
              </div>
            </div>

            {/* Category breakdown table */}
            <div className="md:col-span-7 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category Expense Share
              </div>
              <div className="space-y-2">
                {donutSlices.map((slice) => (
                  <div
                    key={slice.cat}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {slice.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-400 text-[11px]">
                        {slice.percentage.toFixed(1)}%
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white min-w-[70px] text-right">
                        {formatBDT(slice.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View B: Daily Bar Chart */}
        {activeChartTab === 'daily' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Daily Expenses (Day 1 to {daysInSelectedMonth})</span>
              <span className="font-mono">Peak Day: {formatBDT(maxDailySpend)}</span>
            </div>

            {/* Scrollable Bar Chart Container */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-1.5 sm:gap-2 h-48 min-w-[550px] pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
                {Array.from({ length: daysInSelectedMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const spend = dailySpendMap[day] || 0;
                  const heightPercent = maxDailySpend > 0 ? (spend / maxDailySpend) * 100 : 0;

                  return (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded font-mono pointer-events-none whitespace-nowrap z-20 shadow-md">
                        {day} {formatMonthYear(selectedMonth).slice(0, 3)}: {formatBDT(spend)}
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[14px] rounded-t transition-all ${
                          spend > 0
                            ? 'bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />

                      {/* Day Label */}
                      <span className="text-[9px] text-slate-400 mt-2 font-mono">
                        {day % 2 === 1 ? day : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View C: 6-Month Income vs Expense Comparison */}
        {activeChartTab === 'compare' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500" /> Expense
                </span>
              </div>
              <span className="text-slate-400 text-xs">
                Comparison vs previous month ({formatMonthYear(prevMonthStr)}):{' '}
                <strong className={expenseDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {expenseDiff > 0 ? '+' : ''}{formatBDT(expenseDiff)} ({expenseDiffPercent}%)
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 pt-6 border-b border-slate-200 dark:border-slate-800 items-end px-2">
              {comparisonMonths.map((m) => {
                const incHeight = maxCompAmount > 0 ? (m.income / maxCompAmount) * 100 : 0;
                const expHeight = maxCompAmount > 0 ? (m.expense / maxCompAmount) * 100 : 0;
                const isCurrent = m.monthStr === selectedMonth;

                return (
                  <div key={m.monthStr} className="flex flex-col items-center justify-end h-full group">
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      {/* Income Bar */}
                      <div
                        className="w-3 sm:w-5 bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                        style={{ height: `${Math.max(4, incHeight)}%` }}
                        title={`${m.label} Income: ${formatBDT(m.income)}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-3 sm:w-5 bg-rose-500 rounded-t transition-all hover:bg-rose-400"
                        style={{ height: `${Math.max(4, expHeight)}%` }}
                        title={`${m.label} Expense: ${formatBDT(m.expense)}`}
                      />
                    </div>
                    <span className={`text-[11px] font-semibold mt-2 ${
                      isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'
                    }`}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Complete Itemized Breakdown for the Selected Month */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Month's Statement Ledger ({monthTransactions.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {formatMonthYear(selectedMonth)}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
          {monthTransactions.map((tx) => {
            const isExp = tx.type === 'expense';
            return (
              <div key={tx.id} className="py-2.5 px-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CategoryIcon category={tx.category} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {tx.title}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatDate(tx.date)} · {tx.category} {tx.note ? `· ${tx.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className={`font-mono font-bold text-right shrink-0 ${
                  isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {isExp ? '-' : '+'}{formatBDT(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
