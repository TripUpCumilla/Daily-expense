import React, { useState } from 'react';
import {
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Calendar,
  AlertCircle,
  Trash2,
  Filter,
  User,
  X,
} from 'lucide-react';
import { DebtRecord, DebtType, UserSettings } from '../../types';
import { addDebt, settleDebt, deleteDebt } from '../../services/storage';
import { formatBDT, formatDate, getTodayString } from '../../utils/formatters';

interface Props {
  debts: DebtRecord[];
  availableBalance: number;
  userSettings: UserSettings;
}

export const DebtManagerView: React.FC<Props> = ({ debts, availableBalance, userSettings }) => {
  const [filterType, setFilterType] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for adding new loan / debt
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<DebtType>('lent');
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Financial aggregates
  const pendingLent = debts
    .filter((d) => d.type === 'lent' && d.status === 'pending')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const pendingBorrowed = debts
    .filter((d) => d.type === 'borrowed' && d.status === 'pending')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const netCredit = pendingLent - pendingBorrowed;

  // Filtered debts
  const filteredDebts = debts.filter((d) => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = d.personName.toLowerCase().includes(q);
      const inPhone = d.phoneNumber?.includes(q) || false;
      const inNote = d.note?.toLowerCase().includes(q) || false;
      const inAmt = d.amount.toString().includes(q);
      if (!inName && !inPhone && !inNote && !inAmt) return false;
    }
    return true;
  });

  const handleOpenAddModal = (type: DebtType) => {
    setModalType(type);
    setPersonName('');
    setPhoneNumber('');
    setAmount('');
    setDate(getTodayString());
    setDueDate('');
    setNote('');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!personName.trim()) {
      setError('Please provide the person\'s name');
      return;
    }

    // Overdraft check if giving a loan and overdraft is not allowed
    if (modalType === 'lent' && !userSettings.allowOverdraft && num > availableBalance) {
      setError(`Cannot lend ${formatBDT(num)}. Available balance is only ${formatBDT(availableBalance)}.`);
      return;
    }

    addDebt({
      userId: userSettings.id,
      type: modalType,
      personName: personName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      amount: num,
      date: date || getTodayString(),
      dueDate: dueDate || undefined,
      note: note.trim() || undefined,
    }, true);

    setIsModalOpen(false);
  };

  const handleSettle = (debtId: string) => {
    settleDebt(debtId);
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Page Title & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HandCoins size={24} className="text-amber-500" />
            <span>Debt & Loan Manager (ধার ও দেনা-পাওনা)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track money you lent to others (আমি পাব) and money you borrowed (আমার দেনা)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleOpenAddModal('lent')}
            className="py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white flex items-center gap-1.5 shadow-sm shadow-amber-600/20 cursor-pointer"
          >
            <ArrowUpRight size={15} />
            <span>Give Loan (ধার দিয়েছি)</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('borrowed')}
            className="py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <ArrowDownLeft size={15} />
            <span>Take Loan (ধার নিয়েছি)</span>
          </button>
        </div>
      </div>

      {/* 3 Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Money Lent (Receivables / আমি পাব) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Lent (আমি পাব / Paona)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatBDT(pendingLent)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Receivable from {debts.filter((d) => d.type === 'lent' && d.status === 'pending').length} people
          </div>
        </div>

        {/* Total Money Borrowed (Payables / আমার দেনা) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Borrowed (আমার দেনা / Dena)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {formatBDT(pendingBorrowed)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Payable to {debts.filter((d) => d.type === 'borrowed' && d.status === 'pending').length} lenders
          </div>
        </div>

        {/* Net Loan Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Net Position (Lent - Borrowed)
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <HandCoins size={16} />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${
            netCredit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatBDT(netCredit, { showSign: true })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {netCredit >= 0 ? 'You are in net credit position' : 'You owe more than you are owed'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search person name, phone number, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterType('lent')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'lent'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              I Lent (আমি পাব)
            </button>
            <button
              onClick={() => setFilterType('borrowed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterType === 'borrowed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              I Borrowed (আমার দেনা)
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pending (বকেয়া)
            </button>
            <button
              onClick={() => setStatusFilter('settled')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'settled'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Settled (পরিশোধিত)
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Records ({filteredDebts.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Settling automatically updates your available balance
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredDebts.map((item) => {
            const isLent = item.type === 'lent';
            const isPending = item.status === 'pending';
            const isConfirmingDelete = confirmDeleteId === item.id;

            return (
              <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Person & Dates */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isLent
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40'
                    }`}>
                      {isLent ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.personName}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isLent
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {isLent ? 'I Lent (আমি পাব)' : 'I Borrowed (আমার দেনা)'}
                        </span>
                        {!isPending && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Settled
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span>Date: {formatDate(item.date)}</span>
                        {item.dueDate && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Due: {formatDate(item.dueDate)}
                          </span>
                        )}
                        {item.phoneNumber && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={11} />
                            {item.phoneNumber}
                          </span>
                        )}
                        {item.note && <span className="italic">"{item.note}"</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Settlement Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className={`text-base font-bold font-mono ${
                        isLent ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {formatBDT(item.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {isPending ? 'Pending' : `Settled on ${item.settledDate ? formatDate(item.settledDate) : ''}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <button
                          onClick={() => handleSettle(item.id)}
                          className={`py-1.5 px-3 text-xs font-semibold rounded-xl text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer ${
                            isLent
                              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {isLent ? 'Mark Returned (টাকা ফেরত পেয়েছি)' : 'Mark Repaid (ঋণ শোধ করেছি)'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={15} />
                          <span>Completed</span>
                        </span>
                      )}

                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Deletion Confirmation */}
                {isConfirmingDelete && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <span className="text-rose-700 dark:text-rose-300">
                      Delete debt record for {item.personName}?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          deleteDebt(item.id);
                          setConfirmDeleteId(null);
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

          {filteredDebts.length === 0 && (
            <div className="p-12 text-center space-y-2">
              <HandCoins size={36} className="text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No debt or loan records found matching your filters.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenAddModal('lent')}
                  className="px-3 py-1.5 rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40"
                >
                  + Record Loan Given (ধার দেওয়া)
                </button>
                <button
                  onClick={() => handleOpenAddModal('borrowed')}
                  className="px-3 py-1.5 rounded-xl border border-indigo-500 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  + Record Loan Borrowed (ধার নেওয়া)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Loan Given or Taken */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className={`p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${
              modalType === 'lent' ? 'bg-amber-500/10' : 'bg-indigo-500/10'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  modalType === 'lent' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {modalType === 'lent' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {modalType === 'lent' ? 'Give Loan (ধার দেওয়া)' : 'Take Loan (ধার নেওয়া)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {modalType === 'lent'
                      ? 'Money given to someone (Deducts from available balance)'
                      : 'Money borrowed from someone (Credits available balance)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {/* Person Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {modalType === 'lent' ? 'Whom did you lend to? (কার কাছ থেকে টাকা পাবেন) *' : 'Whom did you borrow from? (কার কাছ থেকে ধার নিয়েছেন) *'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed, Rafiq Bhai, Cousin"
                  value={personName}
                  onChange={(e) => {
                    setPersonName(e.target.value);
                    setError('');
                  }}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (৳ BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 text-lg font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Phone & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="017xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Expected Return Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Return / Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. For medical emergency, grocery help, friend loan"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-2/3 py-2.5 text-xs font-semibold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    modalType === 'lent' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
