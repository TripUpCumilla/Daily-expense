import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  FileText,
  Edit2,
  Trash2,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Wifi,
  Smartphone,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Transaction } from '../../types';
import { formatBDT, formatDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

interface Props {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<Props> = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen || !transaction) return null;

  const isExpense = transaction.type === 'expense';
  const catMeta = EXPENSE_CATEGORIES[transaction.category] || EXPENSE_CATEGORIES.other;

  const handleDelete = () => {
    onDelete(transaction.id);
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Banner */}
        <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between ${
          isExpense ? 'bg-rose-500/5' : 'bg-emerald-500/5'
        }`}>
          <div className="flex items-center gap-3">
            <CategoryIcon category={transaction.category} size="lg" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {catMeta.label}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {transaction.title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              setShowConfirmDelete(false);
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Amount Display */}
          <div className="text-center py-2">
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
              isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {isExpense ? '-' : '+'}{formatBDT(transaction.amount)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(transaction.date)}
              </span>
              {transaction.time && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {transaction.time}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Subcategory Details Breakdown */}
          {transaction.travelDetails && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Travel Route & Vehicle
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                <MapPin size={14} className="text-sky-500 shrink-0" />
                <span>
                  <strong>From:</strong> {transaction.travelDetails.from}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                <MapPin size={14} className="text-rose-500 shrink-0" />
                <span>
                  <strong>To:</strong> {transaction.travelDetails.to}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                Vehicle: <span className="font-semibold">{transaction.travelDetails.transportType}</span>
              </div>
            </div>
          )}

          {transaction.foodDetails && transaction.foodDetails.items.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Food Items Breakdown
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {transaction.foodDetails.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-none"
                  >
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({item.category})
                      </span>
                    </div>
                    <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {item.quantity ? `${item.quantity}x ` : ''}
                      {formatBDT(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transaction.shoppingDetails && transaction.shoppingDetails.items.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Purchased Products
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {transaction.shoppingDetails.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-none"
                  >
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} × {formatBDT(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatBDT(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transaction.internetDetails && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Operator & Recharge Type
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Recharge Type:</span>
                <span className="font-semibold">{transaction.internetDetails.rechargeType}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Operator:</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {transaction.internetDetails.operator}
                </span>
              </div>
              {transaction.internetDetails.mobileNumber && (
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Number / Acc:</span>
                  <span className="font-mono">{transaction.internetDetails.mobileNumber}</span>
                </div>
              )}
            </div>
          )}

          {transaction.incomeDetails && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Income Source:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {transaction.incomeDetails.source}
              </span>
            </div>
          )}

          {transaction.loanDetails && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5">
              <div className="font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                Debt & Loan Information
              </div>
              <div className="flex justify-between text-slate-800 dark:text-slate-200">
                <span>Associated Person:</span>
                <span className="font-bold">{transaction.loanDetails.personName}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                <span>Type:</span>
                <span className="capitalize">{transaction.loanDetails.loanType}</span>
              </div>
            </div>
          )}

          {/* Note */}
          {transaction.note && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText size={12} />
                Note
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 italic">
                "{transaction.note}"
              </p>
            </div>
          )}

          {/* Delete Confirmation Warning */}
          {showConfirmDelete ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                <AlertTriangle size={16} />
                <span>Confirm Deletion</span>
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-300">
                Deleting this will permanently reverse its financial impact on your balance. Are you sure?
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="py-2.5 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onEdit(transaction);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                <Edit2 size={15} />
                <span>Edit Transaction</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
