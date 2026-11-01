import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  BarChart3,
  History,
  Plus,
} from 'lucide-react';
import { ViewTab } from '../../types';

interface Props {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenQuickAction: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
        {/* 1. Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-14 h-full min-h-[44px] transition-colors ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* 2. Add Expense */}
        <button
          onClick={() => setActiveTab('add-expense')}
          className={`flex flex-col items-center justify-center w-14 h-full min-h-[44px] transition-colors ${
            activeTab === 'add-expense'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PlusCircle size={20} />
          <span className="text-[10px] mt-1 tracking-tight">Add</span>
        </button>

        {/* Floating Quick + Action Button in Center */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            onClick={onOpenQuickAction}
            aria-label="Quick Add Entry"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900 cursor-pointer"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* 3. Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center w-14 h-full min-h-[44px] transition-colors ${
            activeTab === 'calendar'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays size={20} />
          <span className="text-[10px] mt-1 tracking-tight">Calendar</span>
        </button>

        {/* 4. Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center w-14 h-full min-h-[44px] transition-colors ${
            activeTab === 'reports'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] mt-1 tracking-tight">Reports</span>
        </button>

        {/* 5. History */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center w-14 h-full min-h-[44px] transition-colors ${
            activeTab === 'history'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History size={20} />
          <span className="text-[10px] mt-1 tracking-tight">History</span>
        </button>
      </div>
    </nav>
  );
};
