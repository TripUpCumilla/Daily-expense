export type TransactionType = 'expense' | 'income';

export type ExpenseCategory = 'travel' | 'food' | 'shopping' | 'internet' | 'other' | 'loan';
export type TransactionCategory = ExpenseCategory | 'income';

export interface TravelDetails {
  from: string;
  to: string;
  transportType: string;
}

export interface FoodItem {
  id: string;
  category: 'Fast Food' | 'Bengali Food' | 'Snacks & Drinks' | 'Other Food';
  name: string;
  quantity?: number;
  price: number;
}

export interface FoodDetails {
  items: FoodItem[];
}

export interface ShoppingItem {
  id: string;
  category: "Men's Clothing" | "Women's Clothing" | "Accessories" | "Other Shopping";
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShoppingDetails {
  items: ShoppingItem[];
}

export interface InternetDetails {
  rechargeType: string;
  operator: 'Grameenphone' | 'Robi' | 'Airtel' | 'Banglalink' | 'Teletalk' | string;
  mobileNumber?: string;
}

export interface IncomeDetails {
  source: 'Salary' | 'Business' | 'Family' | 'Gift' | 'Freelancing' | 'Loan Borrowed' | 'Loan Returned' | 'Other' | string;
}

export interface OtherDetails {
  expenseName: string;
}

export interface LoanDetails {
  debtId?: string;
  personName: string;
  loanType: 'lent' | 'borrowed' | 'repaid' | 'returned';
}

export type DebtType = 'lent' | 'borrowed'; // lent = I gave loan (আমি পাব / Receivable), borrowed = I owe (আমার দেনা / Payable)
export type DebtStatus = 'pending' | 'settled';

export interface DebtRecord {
  id: string;
  userId: string;
  type: DebtType;
  personName: string;
  phoneNumber?: string;
  amount: number;
  date: string;
  dueDate?: string;
  note?: string;
  status: DebtStatus;
  settledDate?: string;
  createdAt: number;
  transactionId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timestamp: number;
  note?: string;
  travelDetails?: TravelDetails;
  foodDetails?: FoodDetails;
  shoppingDetails?: ShoppingDetails;
  internetDetails?: InternetDetails;
  incomeDetails?: IncomeDetails;
  otherDetails?: OtherDetails;
  loanDetails?: LoanDetails;
}

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  categoryBudgets: {
    travel: number;
    food: number;
    shopping: number;
    internet: number;
    other: number;
    loan?: number;
  };
  lowBalanceThreshold: number;
  allowOverdraft: boolean;
  hideBalance: boolean;
  theme: 'light' | 'dark' | 'system';
  supabaseConfig?: {
    url: string;
    anonKey: string;
    connected: boolean;
    lastSyncedAt?: string;
  };
}

export type ViewTab = 'dashboard' | 'add-expense' | 'calendar' | 'reports' | 'history' | 'all-expenses' | 'debt' | 'settings';
