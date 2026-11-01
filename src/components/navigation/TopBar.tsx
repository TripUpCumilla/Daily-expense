import React from 'react';
import { Plus, Sun, Moon, ArrowDownLeft, ShieldCheck, Database, Bell } from 'lucide-react';
import { ViewTab, UserSettings } from '../../types';

interface Props {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenAddMoney: () => void;
  theme: string;
  onToggleTheme: () => void;
  userSettings: UserSettings;
}

export const TopBar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenAddMoney,
  theme,
  onToggleTheme,
  userSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-700 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          ৳
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap text-left"
        >
          My Expense Tracker
        </button>
      </div>

      {/* Zone 2: Quick Desktop Nav Links */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('all-expenses')}
          className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap ${
            activeTab === 'all-expenses' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          All Expenses
        </button>
        <button
          onClick={() => setActiveTab('debt')}
          className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap ${
            activeTab === 'debt' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Dhar & Debt (ধার)
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap ${
            activeTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap ${
            activeTab === 'reports' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
          }`}
        >
          Analytics
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={onOpenAddMoney}
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <ArrowDownLeft size={16} strokeWidth={2.5} />
          <span>Add Money</span>
        </button>
      </div>
    </header>
  );
};
