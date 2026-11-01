import React from 'react';
import {
  Navigation,
  UtensilsCrossed,
  ShoppingBag,
  Wifi,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Bus,
  Train,
  Car,
  Plane,
  Bike,
  Coffee,
  Pizza,
  Smartphone,
  Receipt,
  Tag,
  HandCoins,
} from 'lucide-react';
import { TransactionCategory } from '../../types';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

interface Props {
  category: TransactionCategory;
  subType?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CategoryIcon: React.FC<Props> = ({ category, subType, size = 'md', className = '' }) => {
  const meta = EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES.other;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-10 h-10 rounded-xl text-base',
    lg: 'w-12 h-12 rounded-2xl text-lg',
    xl: 'w-14 h-14 rounded-2xl text-xl',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  };

  const px = iconSizes[size];

  const renderIcon = () => {
    if (category === 'income') {
      return <ArrowDownLeft size={px} className="text-emerald-600 dark:text-emerald-400" />;
    }

    if (category === 'loan') {
      return <HandCoins size={px} className="text-amber-600 dark:text-amber-400" />;
    }

    if (category === 'travel') {
      if (subType === 'Train') return <Train size={px} className="text-sky-600 dark:text-sky-400" />;
      if (subType === 'Bus') return <Bus size={px} className="text-sky-600 dark:text-sky-400" />;
      if (subType === 'Airplane') return <Plane size={px} className="text-sky-600 dark:text-sky-400" />;
      if (subType === 'Motorcycle' || subType === 'Pathao') return <Bike size={px} className="text-sky-600 dark:text-sky-400" />;
      if (subType === 'Uber' || subType === 'Private Car') return <Car size={px} className="text-sky-600 dark:text-sky-400" />;
      return <Navigation size={px} className="text-sky-600 dark:text-sky-400" />;
    }

    if (category === 'food') {
      if (subType?.includes('Fast Food') || subType?.includes('Pizza') || subType?.includes('Burger')) {
        return <Pizza size={px} className="text-orange-600 dark:text-orange-400" />;
      }
      if (subType?.includes('Snacks') || subType?.includes('Tea') || subType?.includes('Coffee')) {
        return <Coffee size={px} className="text-orange-600 dark:text-orange-400" />;
      }
      return <UtensilsCrossed size={px} className="text-orange-600 dark:text-orange-400" />;
    }

    if (category === 'shopping') {
      return <ShoppingBag size={px} className="text-purple-600 dark:text-purple-400" />;
    }

    if (category === 'internet') {
      if (subType === 'Mobile Recharge') {
        return <Smartphone size={px} className="text-teal-600 dark:text-teal-400" />;
      }
      return <Wifi size={px} className="text-teal-600 dark:text-teal-400" />;
    }

    return <Layers size={px} className="text-slate-600 dark:text-slate-400" />;
  };

  const bgStyles = {
    travel: 'bg-sky-100/80 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/40',
    food: 'bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800/40',
    shopping: 'bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40',
    internet: 'bg-teal-100/80 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/40',
    loan: 'bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/40',
    other: 'bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40',
    income: 'bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${sizeClasses[size]} ${bgStyles[category] || bgStyles.other} ${className}`}
      aria-label={meta.label}
    >
      {renderIcon()}
    </div>
  );
};
