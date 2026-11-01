import React, { useState } from 'react';
import {
  Navigation,
  UtensilsCrossed,
  ShoppingBag,
  Wifi,
  Layers,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  HandCoins,
} from 'lucide-react';
import {
  TRANSPORT_OPTIONS,
  FAST_FOOD_ITEMS,
  BENGALI_FOOD_ITEMS,
  SNACKS_AND_DRINKS,
  MENS_CLOTHING,
  WOMENS_CLOTHING,
  ACCESSORIES,
  INTERNET_RECHARGE_TYPES,
  MOBILE_OPERATORS,
  EXPENSE_CATEGORIES,
} from '../../constants/categories';
import { ExpenseCategory, FoodItem, ShoppingItem, UserSettings } from '../../types';
import { addTransaction, addDebt } from '../../services/storage';
import { getTodayString, getCurrentTimeString, formatBDT } from '../../utils/formatters';

interface Props {
  availableBalance: number;
  userSettings: UserSettings;
  onSuccess: () => void;
  onOpenSettings: () => void;
}

export const AddExpenseView: React.FC<Props> = ({
  availableBalance,
  userSettings,
  onSuccess,
  onOpenSettings,
}) => {
  const [activeCategory, setActiveCategory] = useState<ExpenseCategory>('travel');
  const [date, setDate] = useState<string>(getTodayString());
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [overdraftPrompt, setOverdraftPrompt] = useState<{ amount: number } | null>(null);
  const [successSaved, setSuccessSaved] = useState<boolean>(false);

  // --- 1. Travel Form State ---
  const [travelFrom, setTravelFrom] = useState('');
  const [travelTo, setTravelTo] = useState('');
  const [transportType, setTransportType] = useState<string>('Rickshaw');
  const [customTransport, setCustomTransport] = useState('');
  const [travelAmount, setTravelAmount] = useState('');

  // --- 2. Food Form State (Multi-item support) ---
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    { id: '1', category: 'Bengali Food', name: 'Kacchi Biryani', quantity: 1, price: 350 },
  ]);
  const [currentFoodCategory, setCurrentFoodCategory] = useState<'Fast Food' | 'Bengali Food' | 'Snacks & Drinks' | 'Other Food'>('Bengali Food');
  const [currentFoodName, setCurrentFoodName] = useState<string>('Beef Biryani');
  const [customFoodName, setCustomFoodName] = useState('');
  const [currentFoodQty, setCurrentFoodQty] = useState<number>(1);
  const [currentFoodPrice, setCurrentFoodPrice] = useState<string>('280');

  // --- 3. Shopping Form State (Multi-product support with Qty x Unit Price = Total) ---
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    { id: '1', category: "Men's Clothing", name: 'Punjabi', quantity: 1, unitPrice: 2200, totalPrice: 2200 },
  ]);
  const [currentShopCategory, setCurrentShopCategory] = useState<"Men's Clothing" | "Women's Clothing" | "Accessories" | "Other Shopping">("Men's Clothing");
  const [currentShopName, setCurrentShopName] = useState<string>('T-Shirt');
  const [customShopName, setCustomShopName] = useState('');
  const [currentShopQty, setCurrentShopQty] = useState<number>(1);
  const [currentShopUnitPrice, setCurrentShopUnitPrice] = useState<string>('850');

  // --- 4. Internet Form State ---
  const [rechargeType, setRechargeType] = useState<string>('Internet Package');
  const [operator, setOperator] = useState<string>('Grameenphone');
  const [mobileNumber, setMobileNumber] = useState('');
  const [internetAmount, setInternetAmount] = useState('');

  // --- 5. Other Form State ---
  const [otherName, setOtherName] = useState('');
  const [otherAmount, setOtherAmount] = useState('');

  // --- 6. Loan Given (ধার দেওয়া) Form State ---
  const [loanPersonName, setLoanPersonName] = useState('');
  const [loanPhoneNumber, setLoanPhoneNumber] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');

  // Auto-calculated totals
  const totalFoodAmount = foodItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalShoppingAmount = shoppingItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

  // Helpers to add items to food and shopping
  const handleAddFoodItem = () => {
    const priceNum = parseFloat(currentFoodPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Please enter a valid price for the food item');
      return;
    }
    const name = currentFoodCategory === 'Other Food' ? customFoodName.trim() || 'Custom Dish' : currentFoodName;
    const newItem: FoodItem = {
      id: Date.now().toString(),
      category: currentFoodCategory,
      name,
      quantity: currentFoodQty > 0 ? currentFoodQty : 1,
      price: priceNum,
    };
    setFoodItems([...foodItems, newItem]);
    setCurrentFoodPrice('');
    setCustomFoodName('');
    setErrorMessage('');
  };

  const handleRemoveFoodItem = (id: string) => {
    if (foodItems.length <= 1) {
      setErrorMessage('At least one food item is required');
      return;
    }
    setFoodItems(foodItems.filter((i) => i.id !== id));
  };

  const handleAddShoppingItem = () => {
    const unitPriceNum = parseFloat(currentShopUnitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
      setErrorMessage('Please enter a valid unit price for the product');
      return;
    }
    const qty = currentShopQty > 0 ? currentShopQty : 1;
    const name = currentShopCategory === 'Other Shopping' ? customShopName.trim() || 'Custom Product' : currentShopName;
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      category: currentShopCategory,
      name,
      quantity: qty,
      unitPrice: unitPriceNum,
      totalPrice: qty * unitPriceNum,
    };
    setShoppingItems([...shoppingItems, newItem]);
    setCurrentShopUnitPrice('');
    setCustomShopName('');
    setErrorMessage('');
  };

  const handleRemoveShoppingItem = (id: string) => {
    if (shoppingItems.length <= 1) {
      setErrorMessage('At least one shopping product is required');
      return;
    }
    setShoppingItems(shoppingItems.filter((i) => i.id !== id));
  };

  // Determine current form total amount
  const computeFinalAmount = (): number => {
    switch (activeCategory) {
      case 'travel':
        return parseFloat(travelAmount) || 0;
      case 'food':
        return totalFoodAmount;
      case 'shopping':
        return totalShoppingAmount;
      case 'internet':
        return parseFloat(internetAmount) || 0;
      case 'other':
        return parseFloat(otherAmount) || 0;
      case 'loan':
        return parseFloat(loanAmount) || 0;
      default:
        return 0;
    }
  };

  const executeSaveExpense = (bypassOverdraft = false) => {
    const finalAmount = computeFinalAmount();
    if (finalAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0');
      return;
    }

    // Overdraft protection rule:
    // Prevent expenses greater than available balance unless user enables overdraft
    if (!bypassOverdraft && !userSettings.allowOverdraft && finalAmount > availableBalance) {
      setOverdraftPrompt({ amount: finalAmount });
      return;
    }

    let title = '';
    const nowTime = getCurrentTimeString();

    if (activeCategory === 'travel') {
      const vehicle = transportType === 'Other' && customTransport.trim() ? customTransport.trim() : transportType;
      const fromText = travelFrom.trim() || 'Start';
      const toText = travelTo.trim() || 'Destination';
      title = `${vehicle}: ${fromText} to ${toText}`;

      addTransaction({
        type: 'expense',
        category: 'travel',
        title,
        amount: finalAmount,
        date: date || getTodayString(),
        time: nowTime,
        note: note.trim() || undefined,
        travelDetails: {
          from: travelFrom.trim(),
          to: travelTo.trim(),
          transportType: vehicle,
        },
      });
    } else if (activeCategory === 'food') {
      const firstItem = foodItems[0]?.name || 'Food';
      title = foodItems.length === 1 ? firstItem : `${firstItem} & ${foodItems.length - 1} more items`;

      addTransaction({
        type: 'expense',
        category: 'food',
        title,
        amount: finalAmount,
        date: date || getTodayString(),
        time: nowTime,
        note: note.trim() || undefined,
        foodDetails: {
          items: foodItems,
        },
      });
    } else if (activeCategory === 'shopping') {
      const firstItem = shoppingItems[0]?.name || 'Item';
      title = shoppingItems.length === 1 ? firstItem : `${firstItem} + ${shoppingItems.length - 1} items`;

      addTransaction({
        type: 'expense',
        category: 'shopping',
        title,
        amount: finalAmount,
        date: date || getTodayString(),
        time: nowTime,
        note: note.trim() || undefined,
        shoppingDetails: {
          items: shoppingItems,
        },
      });
    } else if (activeCategory === 'internet') {
      title = `${operator} ${rechargeType}`;

      addTransaction({
        type: 'expense',
        category: 'internet',
        title,
        amount: finalAmount,
        date: date || getTodayString(),
        time: nowTime,
        note: note.trim() || undefined,
        internetDetails: {
          rechargeType,
          operator,
          mobileNumber: mobileNumber.trim() || undefined,
        },
      });
    } else if (activeCategory === 'loan') {
      const pName = loanPersonName.trim() || 'Someone';
      title = `Money Lent to ${pName} (ধার দিয়েছি)`;

      addDebt({
        userId: userSettings.id,
        type: 'lent',
        personName: pName,
        phoneNumber: loanPhoneNumber.trim() || undefined,
        amount: finalAmount,
        date: date || getTodayString(),
        dueDate: loanDueDate || undefined,
        note: note.trim() || undefined,
      }, true);
    } else if (activeCategory === 'other') {
      title = otherName.trim() || 'Miscellaneous Expense';

      addTransaction({
        type: 'expense',
        category: 'other',
        title,
        amount: finalAmount,
        date: date || getTodayString(),
        time: nowTime,
        note: note.trim() || undefined,
        otherDetails: {
          expenseName: title,
        },
      });
    }

    setSuccessSaved(true);
    setTimeout(() => {
      setSuccessSaved(false);
      onSuccess();
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    executeSaveExpense(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page Title & Balance Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Add New Expense
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Categorized personal expense recorder in Bangladeshi Taka
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span>Available:</span>
          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatBDT(availableBalance)}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
        {[
          { id: 'travel', label: 'Travel', icon: Navigation, color: 'text-sky-600' },
          { id: 'food', label: 'Food', icon: UtensilsCrossed, color: 'text-orange-600' },
          { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-purple-600' },
          { id: 'internet', label: 'Internet', icon: Wifi, color: 'text-teal-600' },
          { id: 'loan', label: 'Loan (ধার)', icon: HandCoins, color: 'text-amber-600' },
          { id: 'other', label: 'Other', icon: Layers, color: 'text-slate-600' },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id as ExpenseCategory);
                setErrorMessage('');
              }}
              className={`flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={isActive ? cat.color : ''} />
              <span className="text-[11px] mt-1">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overdraft Alert Modal */}
      {overdraftPrompt && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <ShieldAlert size={20} />
            <span>Expense Exceeds Available Balance</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            This expense of <strong>{formatBDT(overdraftPrompt.amount)}</strong> is higher than your current available balance of <strong>{formatBDT(availableBalance)}</strong>. Overdraft is currently disabled in your settings.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOverdraftPrompt(null)}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              Cancel & Adjust Amount
            </button>
            <button
              type="button"
              onClick={() => {
                setOverdraftPrompt(null);
                executeSaveExpense(true); // Allow this transaction to proceed
              }}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
            >
              Proceed Anyway (Allow Overdraft)
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs text-amber-800 dark:text-amber-300 underline ml-2"
            >
              Configure in Settings
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Expense Form Container */}
      <form onSubmit={handleFormSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        {/* A. Travel Form */}
        {activeCategory === 'travel' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  From (Starting Location) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi, Uttara, Mohakhali"
                  value={travelFrom}
                  onChange={(e) => setTravelFrom(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  To (Destination) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan, Motijheel, Airport"
                  value={travelTo}
                  onChange={(e) => setTravelTo(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
            </div>

            {/* Transport Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transport Type *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {TRANSPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTransportType(opt)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      transportType === opt
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {transportType === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify vehicle / transit type..."
                  value={customTransport}
                  onChange={(e) => setCustomTransport(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (৳ BDT) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="0"
                  value={travelAmount}
                  onChange={(e) => setTravelAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* B. Food Form (Multi-item support) */}
        {activeCategory === 'food' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-900 dark:text-orange-300">
                  Add Food Item to Entry
                </span>
                <span className="text-[11px] text-orange-700 dark:text-orange-400">
                  Multiple items auto-calculate total
                </span>
              </div>

              {/* Food Category Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Bengali Food', 'Fast Food', 'Snacks & Drinks', 'Other Food'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCurrentFoodCategory(cat);
                      if (cat === 'Bengali Food') setCurrentFoodName(BENGALI_FOOD_ITEMS[1]);
                      else if (cat === 'Fast Food') setCurrentFoodName(FAST_FOOD_ITEMS[0]);
                      else if (cat === 'Snacks & Drinks') setCurrentFoodName(SNACKS_AND_DRINKS[0]);
                    }}
                    className={`py-1.5 px-2 text-xs rounded-xl border text-center transition-all ${
                      currentFoodCategory === cat
                        ? 'bg-orange-500 text-white border-orange-500 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Food Item Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Select Dish / Food
                  </label>
                  {currentFoodCategory === 'Bengali Food' && (
                    <select
                      value={currentFoodName}
                      onChange={(e) => setCurrentFoodName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {BENGALI_FOOD_ITEMS.map((dish) => (
                        <option key={dish} value={dish}>{dish}</option>
                      ))}
                    </select>
                  )}
                  {currentFoodCategory === 'Fast Food' && (
                    <select
                      value={currentFoodName}
                      onChange={(e) => setCurrentFoodName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {FAST_FOOD_ITEMS.map((dish) => (
                        <option key={dish} value={dish}>{dish}</option>
                      ))}
                    </select>
                  )}
                  {currentFoodCategory === 'Snacks & Drinks' && (
                    <select
                      value={currentFoodName}
                      onChange={(e) => setCurrentFoodName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {SNACKS_AND_DRINKS.map((dish) => (
                        <option key={dish} value={dish}>{dish}</option>
                      ))}
                    </select>
                  )}
                  {currentFoodCategory === 'Other Food' && (
                    <input
                      type="text"
                      placeholder="Type custom food name..."
                      value={customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Price (৳)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="Price"
                      value={currentFoodPrice}
                      onChange={(e) => setCurrentFoodPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddFoodItem}
                      className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of current food items */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Included Items ({foodItems.length})
              </label>
              {foodItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({item.category})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                      {formatBDT(item.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFoodItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-xs font-bold text-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                <span>Calculated Total Food Cost:</span>
                <span className="font-mono text-base">{formatBDT(totalFoodAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* C. Shopping Form (Multi-product with Qty x Unit Price) */}
        {activeCategory === 'shopping' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                  Add Shopping Product
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-400">
                  Calculates Quantity × Unit Price
                </span>
              </div>

              {/* Shopping Category Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["Men's Clothing", "Women's Clothing", "Accessories", "Other Shopping"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCurrentShopCategory(cat);
                      if (cat === "Men's Clothing") setCurrentShopName(MENS_CLOTHING[0]);
                      else if (cat === "Women's Clothing") setCurrentShopName(WOMENS_CLOTHING[0]);
                      else if (cat === 'Accessories') setCurrentShopName(ACCESSORIES[0]);
                    }}
                    className={`py-1.5 px-2 text-xs rounded-xl border text-center transition-all ${
                      currentShopCategory === cat
                        ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product selector & calculation inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Product Name
                  </label>
                  {currentShopCategory === "Men's Clothing" && (
                    <select
                      value={currentShopName}
                      onChange={(e) => setCurrentShopName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {MENS_CLOTHING.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  )}
                  {currentShopCategory === "Women's Clothing" && (
                    <select
                      value={currentShopName}
                      onChange={(e) => setCurrentShopName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {WOMENS_CLOTHING.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  )}
                  {currentShopCategory === 'Accessories' && (
                    <select
                      value={currentShopName}
                      onChange={(e) => setCurrentShopName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {ACCESSORIES.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  )}
                  {currentShopCategory === 'Other Shopping' && (
                    <input
                      type="text"
                      placeholder="Custom item name..."
                      value={customShopName}
                      onChange={(e) => setCustomShopName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentShopQty}
                    onChange={(e) => setCurrentShopQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Unit Price (৳)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="Price"
                      value={currentShopUnitPrice}
                      onChange={(e) => setCurrentShopUnitPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddShoppingItem}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of current shopping items */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Purchased Products ({shoppingItems.length})
              </label>
              {shoppingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {item.quantity} × {formatBDT(item.unitPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {formatBDT(item.totalPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveShoppingItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-xs font-bold text-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                <span>Calculated Total Shopping Amount:</span>
                <span className="font-mono text-base">{formatBDT(totalShoppingAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* D. Internet Expense Form */}
        {activeCategory === 'internet' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Recharge / Bill Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTERNET_RECHARGE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRechargeType(type)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                      rechargeType === type
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Operator / Provider *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {MOBILE_OPERATORS.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperator(op)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      operator === op
                        ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number / Account ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01712345678 or Fiber ID"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (৳ BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="0"
                    value={internetAmount}
                    onChange={(e) => setInternetAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* E. Other Expense Form */}
        {activeCategory === 'other' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Name / Title *
              </label>
              <input
                type="text"
                placeholder="e.g. House Rent, Medicine, Tuition Fee, Electricity Bill"
                value={otherName}
                onChange={(e) => setOtherName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (৳ BDT) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                  ৳
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="0"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* F. Loan Given (ধার দেওয়া) Form */}
        {activeCategory === 'loan' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
              Record money given as a loan to someone (আমি পাব). This will deduct from your available balance and create a trackable record in the Debt Manager until returned.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Person's Name (কাকে ধার দিয়েছেন) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir, Rafiq Bhai"
                  value={loanPersonName}
                  onChange={(e) => setLoanPersonName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="017xxxxxxxx"
                  value={loanPhoneNumber}
                  onChange={(e) => setLoanPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (৳ BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="0"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Return Date (Optional)
                </label>
                <input
                  type="date"
                  value={loanDueDate}
                  onChange={(e) => setLoanDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Common Fields: Date & Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Expense Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via bKash, Star Kabab Dhanmondi, discount applied"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={successSaved}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            {successSaved ? (
              <>
                <CheckCircle2 size={18} />
                <span>Expense Recorded Successfully!</span>
              </>
            ) : (
              <>
                <span>Save Expense ({formatBDT(computeFinalAmount())})</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
