export const TRANSPORT_OPTIONS = [
  'Bus',
  'Train',
  'CNG',
  'Rickshaw',
  'Auto Rickshaw',
  'Uber',
  'Pathao',
  'Motorcycle',
  'Private Car',
  'Airplane',
  'Boat',
  'Other',
] as const;

export const FAST_FOOD_ITEMS = [
  'Burger',
  'Pizza',
  'Sandwich',
  'French Fries',
  'Fried Chicken',
  'Chicken Fry',
  'Shawarma',
  'Hot Dog',
  'Pasta',
  'Noodles',
  'Momos',
  'Chicken Nuggets',
  'Sub Sandwich',
  'Other Fast Food',
] as const;

export const BENGALI_FOOD_ITEMS = [
  'Rice',
  'Beef Biryani',
  'Chicken Biryani',
  'Kacchi Biryani',
  'Tehari',
  'Khichuri',
  'Beef Bhuna',
  'Chicken Curry',
  'Fish Curry',
  'Hilsa Fish',
  'Vorta',
  'Dal',
  'Vegetable',
  'Paratha',
  'Roti',
  'Rice and Beef',
  'Rice and Fish',
  'Other Bengali Food',
] as const;

export const SNACKS_AND_DRINKS = [
  'Tea',
  'Coffee',
  'Juice',
  'Soft Drinks',
  'Cake',
  'Biscuits',
  'Singara',
  'Samosa',
  'Puri',
  'Fuchka',
  'Chotpoti',
  'Ice Cream',
  'Other Snacks',
] as const;

export const MENS_CLOTHING = [
  'Shirt',
  'T-Shirt',
  'Polo Shirt',
  'Formal Shirt',
  'Casual Shirt',
  'Jeans Pant',
  'Formal Pant',
  'Gabardine Pant',
  'Trouser',
  'Punjabi',
  'Panjabi Pajama',
  'Fotua',
  'Hoodie',
  'Jacket',
  'Sweater',
  'Shorts',
  'Blazer',
  'Suit',
  'Underwear',
  'Socks',
] as const;

export const WOMENS_CLOTHING = [
  'Three Piece',
  'Saree',
  'Kurti',
  'Tops',
  'Jeans',
  'Leggings',
  'Gown',
  'Skirt',
  'Salwar Kameez',
  'Hijab',
  'Abaya',
  'Other Dresses',
] as const;

export const ACCESSORIES = [
  'Shoes',
  'Sandals',
  'Watch',
  'Belt',
  'Wallet',
  'Sunglasses',
  'Bag',
  'Cap',
  'Other Accessories',
] as const;

export const INTERNET_RECHARGE_TYPES = [
  'Mobile Recharge',
  'Internet Package',
  'WiFi Bill',
  'Broadband Bill',
  'SIM Internet Package',
  'Other',
] as const;

export const MOBILE_OPERATORS = [
  'Grameenphone',
  'Robi',
  'Airtel',
  'Banglalink',
  'Teletalk',
] as const;

export const INCOME_SOURCES = [
  'Salary',
  'Business',
  'Family',
  'Gift',
  'Freelancing',
  'Loan Borrowed (ধার নেওয়া)',
  'Loan Returned (ধার ফেরত পাওয়া)',
  'Other',
] as const;

export interface CategoryMeta {
  id: string;
  label: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  iconName: string;
}

export const EXPENSE_CATEGORIES: Record<string, CategoryMeta> = {
  travel: {
    id: 'travel',
    label: 'Travel',
    description: 'Buses, Rickshaw, Uber, Trains, CNG',
    color: '#0284c7', // Sky
    bgLight: 'bg-sky-50 text-sky-700',
    bgDark: 'dark:bg-sky-950/50 dark:text-sky-300',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-900',
    iconName: 'Navigation',
  },
  food: {
    id: 'food',
    label: 'Food & Dining',
    description: 'Fast food, Bengali dishes, Snacks, Drinks',
    color: '#ea580c', // Orange
    bgLight: 'bg-orange-50 text-orange-700',
    bgDark: 'dark:bg-orange-950/50 dark:text-orange-300',
    borderLight: 'border-orange-200',
    borderDark: 'dark:border-orange-900',
    iconName: 'UtensilsCrossed',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    description: "Clothing, Shoes, Watches, Accessories",
    color: '#8b5cf6', // Violet
    bgLight: 'bg-purple-50 text-purple-700',
    bgDark: 'dark:bg-purple-950/50 dark:text-purple-300',
    borderLight: 'border-purple-200',
    borderDark: 'dark:border-purple-900',
    iconName: 'ShoppingBag',
  },
  internet: {
    id: 'internet',
    label: 'Internet & Mobile',
    description: 'Recharge, WiFi, Broadband, SIM packages',
    color: '#0d9488', // Teal
    bgLight: 'bg-teal-50 text-teal-700',
    bgDark: 'dark:bg-teal-950/50 dark:text-teal-300',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-900',
    iconName: 'Wifi',
  },
  loan: {
    id: 'loan',
    label: 'Loan Given (ধার দেওয়া)',
    description: 'Money lent to someone (আমি পাব / Paona)',
    color: '#f59e0b', // Amber
    bgLight: 'bg-amber-50 text-amber-700',
    bgDark: 'dark:bg-amber-950/50 dark:text-amber-300',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-900',
    iconName: 'HandCoins',
  },
  other: {
    id: 'other',
    label: 'Other Expense',
    description: 'Miscellaneous bills, gifts, medicine & utilities',
    color: '#64748b', // Slate
    bgLight: 'bg-slate-100 text-slate-700',
    bgDark: 'dark:bg-slate-800 dark:text-slate-300',
    borderLight: 'border-slate-200',
    borderDark: 'dark:border-slate-700',
    iconName: 'Layers',
  },
  income: {
    id: 'income',
    label: 'Income / Added Money',
    description: 'Salary, Freelancing, Business, Gifts',
    color: '#059669', // Emerald
    bgLight: 'bg-emerald-50 text-emerald-700',
    bgDark: 'dark:bg-emerald-950/50 dark:text-emerald-300',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-900',
    iconName: 'ArrowDownLeft',
  },
};
