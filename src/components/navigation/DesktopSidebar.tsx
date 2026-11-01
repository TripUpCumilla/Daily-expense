import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  BarChart3,
  History,
  Receipt,
  Settings,
  Sun,
  Moon,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  HandCoins,
} from 'lucide-react';
import { ViewTab, UserSettings } from '../../types';
import { formatBDT } from '../../utils/formatters';

interface Props {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  availableBalance: number;
  userSettings: UserSettings;
  onOpenAddMoney: () => void;
  onToggleTheme: () => void;
  theme: string;
}

export const DesktopSidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  availableBalance,
  userSettings,
  onOpenAddMoney,
  onToggleTheme,
  theme,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add Expense', icon: PlusCircle },
    { id: 'debt', label: 'Dhar & Debt (ধার-দেনা)', icon: HandCoins },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'reports', label: 'Monthly Report', icon: BarChart3 },
    { id: 'history', label: 'Transaction History', icon: History },
    { id: 'all-expenses', label: 'All Expenses', icon: Receipt },
    { id: 'settings', label: 'Settings & Supabase', icon: Settings },
  ] as const;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <span className="font-extrabold text-xl leading-none">৳</span>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              My Expense
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal Finance · BDT
            </p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Available Balance Quick Card */}
      <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg shadow-indigo-950/20 border border-indigo-900/40">
        <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
          <span>Available Balance</span>
          <span className="text-[10px] text-indigo-300 font-mono">৳ BDT</span>
        </div>
        <div className="text-xl xl:text-2xl font-bold font-mono tracking-tight text-white mb-3">
          {userSettings.hideBalance ? '••••••••' : formatBDT(availableBalance)}
        </div>
        <button
          onClick={onOpenAddMoney}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowUpRight size={14} />
          <span>Add Money / Income</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ViewTab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
            {userSettings.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {userSettings.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {userSettings.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          title="Account Settings"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Settings size={15} />
        </button>
      </div>
    </aside>
  );
};
