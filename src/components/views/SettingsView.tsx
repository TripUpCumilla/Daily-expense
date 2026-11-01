import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  Wallet,
  User,
  Sliders,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { UserSettings, Transaction } from '../../types';
import {
  updateUserSettings,
  resetToDefaultData,
  clearAllTransactions,
  exportTransactionsJSON,
  importTransactionsJSON,
  exportTransactionsCSV,
} from '../../services/storage';
import {
  testSupabaseConnection,
  syncTransactionsToSupabase,
  getSupabaseTablesSQL,
} from '../../services/supabase';
import { formatBDT } from '../../utils/formatters';

interface Props {
  userSettings: UserSettings;
  allTransactions: Transaction[];
  onSettingsUpdated: (newSettings: UserSettings) => void;
  theme: string;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<Props> = ({
  userSettings,
  allTransactions,
  onSettingsUpdated,
  theme,
  onToggleTheme,
}) => {
  // Form states
  const [name, setName] = useState(userSettings.name);
  const [email, setEmail] = useState(userSettings.email);
  const [monthlyBudget, setMonthlyBudget] = useState(userSettings.monthlyBudget.toString());
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(userSettings.lowBalanceThreshold.toString());
  const [allowOverdraft, setAllowOverdraft] = useState(userSettings.allowOverdraft);

  // Category budgets
  const [catTravel, setCatTravel] = useState(userSettings.categoryBudgets.travel.toString());
  const [catFood, setCatFood] = useState(userSettings.categoryBudgets.food.toString());
  const [catShopping, setCatShopping] = useState(userSettings.categoryBudgets.shopping.toString());
  const [catInternet, setCatInternet] = useState(userSettings.categoryBudgets.internet.toString());
  const [catOther, setCatOther] = useState(userSettings.categoryBudgets.other.toString());

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState(userSettings.supabaseConfig?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(userSettings.supabaseConfig?.anonKey || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);

  // General feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateUserSettings({
      name: name.trim() || 'User',
      email: email.trim(),
      monthlyBudget: parseFloat(monthlyBudget) || 35000,
      lowBalanceThreshold: parseFloat(lowBalanceThreshold) || 5000,
      allowOverdraft,
      categoryBudgets: {
        travel: parseFloat(catTravel) || 6000,
        food: parseFloat(catFood) || 12000,
        shopping: parseFloat(catShopping) || 10000,
        internet: parseFloat(catInternet) || 2000,
        other: parseFloat(catOther) || 5000,
      },
      supabaseConfig: {
        url: supabaseUrl.trim(),
        anonKey: supabaseAnonKey.trim(),
        connected: userSettings.supabaseConfig?.connected || false,
      },
    });

    onSettingsUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setConnectionStatus({
        success: false,
        message: 'Please provide both Supabase Project URL and Anon Public Key',
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setTestingConnection(false);
    setConnectionStatus(res);

    if (res.success) {
      const updated = updateUserSettings({
        supabaseConfig: {
          url: supabaseUrl.trim(),
          anonKey: supabaseAnonKey.trim(),
          connected: true,
          lastSyncedAt: new Date().toISOString(),
        },
      });
      onSettingsUpdated(updated);
    }
  };

  const handleSyncToSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSyncResult('Please configure Supabase URL and Key first.');
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    const res = await syncTransactionsToSupabase(allTransactions, supabaseUrl.trim(), supabaseAnonKey.trim());
    setSyncing(false);
    if (res.success) {
      setSyncResult(`Successfully synced ${res.count} transactions to Supabase!`);
    } else {
      setSyncResult(`Sync failed: ${res.error}`);
    }
  };

  const handleCopySQL = () => {
    const sql = getSupabaseTablesSQL();
    navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importTransactionsJSON(content);
      setRestoreFeedback(res.message);
      setTimeout(() => setRestoreFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 lg:pb-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personal profile, monthly budget caps, overdraft rules, and Supabase database connectivity
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>All settings saved successfully!</span>
        </div>
      )}

      {/* 1. Profile & Theme Setting */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <User size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Profile & App Theme</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Visual Theme
              </span>
              <span className="text-[11px] text-slate-400">
                Switch between light and dark fintech mode
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} className="text-amber-400" />
                  <span>Current: Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-indigo-600" />
                  <span>Current: Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Budget & Financial Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Budget Targets & Financial Safety</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Monthly Budget Limit (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Low Balance Warning Threshold (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  value={lowBalanceThreshold}
                  onChange={(e) => setLowBalanceThreshold(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Overdraft Rule Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Allow Overdraft / Negative Balance
              </span>
              <span className="text-[11px] text-slate-400">
                Rule 8: If disabled, prevents logging expenses greater than current available balance.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAllowOverdraft(!allowOverdraft)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                allowOverdraft ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Category-wise Budget Limits */}
          <div className="pt-2">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Category-Wise Budget Limits (৳ BDT)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Travel</label>
                <input
                  type="number"
                  value={catTravel}
                  onChange={(e) => setCatTravel(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Food</label>
                <input
                  type="number"
                  value={catFood}
                  onChange={(e) => setCatFood(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Shopping</label>
                <input
                  type="number"
                  value={catShopping}
                  onChange={(e) => setCatShopping(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Internet</label>
                <input
                  type="number"
                  value={catInternet}
                  onChange={(e) => setCatInternet(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Other</label>
                <input
                  type="number"
                  value={catOther}
                  onChange={(e) => setCatOther(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Save Budget & Rules
            </button>
          </div>
        </div>
      </form>

      {/* 3. Supabase Cloud Database Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Database size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span>Supabase Cloud Database & RLS Integration</span>
          </div>
          {userSettings.supabaseConfig?.connected && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Connected
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Store your financial transactions in PostgreSQL tables with Row Level Security (RLS) on Supabase.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Public Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {connectionStatus && (
          <div className={`p-3 rounded-xl text-xs border ${
            connectionStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}>
            {connectionStatus.message}
          </div>
        )}

        {syncResult && (
          <div className="p-3 rounded-xl text-xs bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            {syncResult}
          </div>
        )}

        {/* Buttons for Supabase */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleTestSupabase}
            disabled={testingConnection}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={testingConnection ? 'animate-spin' : ''} />
            <span>Test Connection</span>
          </button>

          <button
            type="button"
            onClick={handleSyncToSupabase}
            disabled={syncing}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <Upload size={14} />
            <span>Sync {allTransactions.length} Transactions to Supabase</span>
          </button>

          <button
            type="button"
            onClick={handleCopySQL}
            className="py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedSQL ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSQL ? 'SQL Copied!' : 'Copy Supabase DDL SQL'}</span>
          </button>
        </div>
      </div>

      {/* 4. Data Backup, Export & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          <Download size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>Data Backup, Export & Recovery</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Safeguard all personal accounting data. Export as JSON backup or Excel-compatible CSV.
        </p>

        {restoreFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs">
            {restoreFeedback}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {/* CSV Export */}
          <button
            type="button"
            onClick={() => exportTransactionsCSV(allTransactions)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Export Transactions (CSV / Excel)</span>
          </button>

          {/* JSON Full Backup */}
          <button
            type="button"
            onClick={exportTransactionsJSON}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span>Download JSON Backup</span>
          </button>

          {/* JSON Restore file trigger */}
          <label className="py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload size={15} />
            <span>Restore from JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>
        </div>

        {/* Danger Zone: Reset to sample data or clear all */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
            Reset & Clear Data
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearAllTransactions}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reset to Empty State (Start Today)
            </button>

            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAllTransactions();
                    setShowClearConfirm(false);
                  }}
                  className="py-2 px-3 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                >
                  Yes, Wipe All Transactions
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="py-2 px-3 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Clear All Transactions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
