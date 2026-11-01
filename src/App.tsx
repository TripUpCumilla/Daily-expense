import React, { useState, useEffect } from 'react';
import {
  getTransactions,
  getUserSettings,
  updateUserSettings,
  deleteTransaction,
  calculateFinancials,
  subscribeStorage,
  getDebts,
} from './services/storage';
import { Transaction, UserSettings, ViewTab, DebtRecord } from './types';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { TopBar } from './components/navigation/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { AddExpenseView } from './components/views/AddExpenseView';
import { CalendarView } from './components/views/CalendarView';
import { MonthlyReportView } from './components/views/MonthlyReportView';
import { TransactionHistoryView } from './components/views/TransactionHistoryView';
import { AllExpensesView } from './components/views/AllExpensesView';
import { DebtManagerView } from './components/views/DebtManagerView';
import { SettingsView } from './components/views/SettingsView';

import { AddMoneyModal } from './components/modals/AddMoneyModal';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { EditTransactionModal } from './components/modals/EditTransactionModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions());
  const [debts, setDebts] = useState<DebtRecord[]>(getDebts());
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());

  // Modal states
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('my_expense_tracker_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('my_expense_tracker_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync with storage changes
  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setTransactions([...getTransactions()]);
      setDebts([...getDebts()]);
      setUserSettings({ ...getUserSettings() });
    });
    return unsubscribe;
  }, []);

  // Compute live financials
  const financials = calculateFinancials(transactions);

  const handleToggleHideBalance = () => {
    const updated = updateUserSettings({ hideBalance: !userSettings.hideBalance });
    setUserSettings(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableBalance={financials.availableBalance}
        userSettings={userSettings}
        onOpenAddMoney={() => setIsAddMoneyOpen(true)}
        onToggleTheme={toggleTheme}
        theme={theme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Top Bar */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddMoney={() => setIsAddMoneyOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          userSettings={userSettings}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              financials={financials}
              userSettings={userSettings}
              onOpenAddMoney={() => setIsAddMoneyOpen(true)}
              setActiveTab={setActiveTab}
              onToggleHideBalance={handleToggleHideBalance}
              onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
            />
          )}

          {activeTab === 'add-expense' && (
            <AddExpenseView
              availableBalance={financials.availableBalance}
              userSettings={userSettings}
              onSuccess={() => setActiveTab('dashboard')}
              onOpenSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              allTransactions={transactions}
              onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <MonthlyReportView
              allTransactions={transactions}
              userSettings={userSettings}
            />
          )}

          {activeTab === 'history' && (
            <TransactionHistoryView
              transactions={financials.allSortedTransactions}
              onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
              onEditTransaction={(tx) => setSelectedTxForEdit(tx)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'all-expenses' && (
            <AllExpensesView
              allTransactions={transactions}
              onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
            />
          )}

          {activeTab === 'debt' && (
            <DebtManagerView
              debts={debts}
              availableBalance={financials.availableBalance}
              userSettings={userSettings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userSettings={userSettings}
              allTransactions={transactions}
              onSettingsUpdated={(newSettings) => setUserSettings(newSettings)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation with Floating Quick (+) Entry Button */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Modals & Dialogs */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAddExpense={() => setActiveTab('add-expense')}
        onSelectAddMoney={() => setIsAddMoneyOpen(true)}
        onSelectDebt={() => setActiveTab('debt')}
      />

      <TransactionDetailModal
        transaction={selectedTxForDetail}
        isOpen={!!selectedTxForDetail}
        onClose={() => setSelectedTxForDetail(null)}
        onEdit={(tx) => setSelectedTxForEdit(tx)}
        onDelete={(id) => handleDeleteTransaction(id)}
      />

      <EditTransactionModal
        transaction={selectedTxForEdit}
        isOpen={!!selectedTxForEdit}
        onClose={() => setSelectedTxForEdit(null)}
      />
    </div>
  );
}
