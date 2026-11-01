import React from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Receipt, PlusCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddExpense: () => void;
  onSelectAddMoney: () => void;
  onSelectDebt?: () => void;
}

export const QuickActionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectAddExpense,
  onSelectAddMoney,
  onSelectDebt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        {/* Grab handle for mobile sheet */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-2 mb-2" />

        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Transaction Entry
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          What would you like to record right now?
        </p>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {/* Add Expense Choice */}
          <button
            onClick={() => {
              onClose();
              onSelectAddExpense();
            }}
            className="w-full p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 flex items-center gap-3.5 text-left transition-all active:scale-[0.98] group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
              <PlusCircle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Expense
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Travel, Food, Shopping, Bills
              </p>
            </div>
            <div className="text-rose-600 dark:text-rose-400 font-mono text-xs font-bold">
              - ৳
            </div>
          </button>

          {/* Add Money / Income Choice */}
          <button
            onClick={() => {
              onClose();
              onSelectAddMoney();
            }}
            className="w-full p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 flex items-center gap-3.5 text-left transition-all active:scale-[0.98] group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <ArrowDownLeft size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Money / Income
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Salary, Freelancing, Business
              </p>
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              + ৳
            </div>
          </button>

          {/* Debt / Loan Choice */}
          {onSelectDebt && (
            <button
              onClick={() => {
                onClose();
                onSelectDebt();
              }}
              className="w-full p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 flex items-center gap-3.5 text-left transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Receipt size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Debt & Loan (ধার ও দেনা)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  কাউকে ধার দেওয়া বা পাওনা রেকর্ড
                </p>
              </div>
              <div className="text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
                ৳
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
