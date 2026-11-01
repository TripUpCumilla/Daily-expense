import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction } from '../types';

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  if (url && key) {
    if (url !== currentUrl || key !== currentKey || !supabaseInstance) {
      try {
        supabaseInstance = createClient(url, key);
        currentUrl = url;
        currentKey = key;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        return null;
      }
    }
    return supabaseInstance;
  }
  return supabaseInstance;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, key);
    // Ping by checking table or auth
    const { error } = await client.from('transactions').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still connected to Supabase
      if (error.message.includes('relation "public.transactions" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: tables need to be created using the SQL script below)',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection failed. Please check URL and Anon Key.';
    return { success: false, message: msg };
  }
}

export async function syncTransactionsToSupabase(
  transactions: Transaction[],
  url: string,
  key: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const client = getSupabaseClient(url, key);
    if (!client) throw new Error('Supabase client not initialized');

    // Format transactions for Supabase table
    const formatted = transactions.map((t) => ({
      id: t.id,
      user_id: t.userId,
      type: t.type,
      category: t.category,
      title: t.title,
      amount: t.amount,
      date: t.date,
      time: t.time,
      note: t.note || null,
      travel_details: t.travelDetails ? JSON.stringify(t.travelDetails) : null,
      food_details: t.foodDetails ? JSON.stringify(t.foodDetails) : null,
      shopping_details: t.shoppingDetails ? JSON.stringify(t.shoppingDetails) : null,
      internet_details: t.internetDetails ? JSON.stringify(t.internetDetails) : null,
      income_details: t.incomeDetails ? JSON.stringify(t.incomeDetails) : null,
      other_details: t.otherDetails ? JSON.stringify(t.otherDetails) : null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('transactions').upsert(formatted, { onConflict: 'id' });
    if (error) throw error;

    return { success: true, count: formatted.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sync failed';
    return { success: false, count: 0, error: msg };
  }
}

/**
 * Returns complete PostgreSQL DDL and Row Level Security setup for Supabase
 */
export function getSupabaseTablesSQL(): string {
  return `-- =========================================================
-- Supabase Schema for "My Expense Tracker" (Bangladeshi Taka BDT)
-- =========================================================

-- 1. Create Users Profile Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'BDT',
  monthly_budget NUMERIC DEFAULT 35000,
  allow_overdraft BOOLEAN DEFAULT false,
  low_balance_threshold NUMERIC DEFAULT 5000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  budget_limit NUMERIC DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Categories
INSERT INTO public.expense_categories (id, name, budget_limit)
VALUES 
  ('travel', 'Travel Expense', 8000),
  ('food', 'Food Expense', 12000),
  ('shopping', 'Shopping Expense', 10000),
  ('internet', 'Internet & Mobile Recharge', 2500),
  ('other', 'Other Expense', 5000)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  note TEXT,
  travel_details JSONB,
  food_details JSONB,
  shopping_details JSONB,
  internet_details JSONB,
  income_details JSONB,
  other_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- 5. Standard Permissive RLS Policies (or authenticated user policy)
CREATE POLICY "Enable all access for local app client"
  ON public.transactions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read categories for all"
  ON public.expense_categories FOR SELECT
  USING (true);

-- 6. Indexes for Fast Reports & Date Filtering
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions (date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions (type);
`;
}
