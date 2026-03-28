/**
 * SubscriptionContext
 * Global shared state for subscriptions — used by all tab screens.
 * Provides: subscriptions, CRUD actions, and computed values
 * (totalMonthly, totalYearly, upcomingRenewals, categorySpending).
 */

import { HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from '@/constants/data';
import dayjs from 'dayjs';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategorySpend {
  category: string;
  monthly: number;
  color: string;
}

interface SubscriptionContextValue {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  /** Monthly equivalent total across all active subscriptions */
  totalMonthly: number;
  /** Yearly equivalent total */
  totalYearly: number;
  /** Subscriptions with renewal in next 30 days, sorted soonest-first */
  upcomingRenewals: Subscription[];
  /** Spending grouped by category, sorted descending */
  categorySpending: CategorySpend[];
  /** Hardcoded upcoming cards (Spotify, Notion, Figma) enriched with real renewal info */
  upcomingCards: typeof UPCOMING_SUBSCRIPTIONS;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toMonthly = (sub: Subscription): number => {
  if (sub.status === 'cancelled') return 0;
  if (sub.billing === 'Yearly') return sub.price / 12;
  return sub.price;
};

const CATEGORY_PALETTE: Record<string, string> = {
  Entertainment: '#f5ddd8',
  'AI Tools': '#d8eaf5',
  'Developer Tools': '#e8def8',
  Design: '#d8f0d8',
  Productivity: '#ffd5dc',
  Cloud: '#c0aede',
  Music: '#b6e3f4',
  Other: '#d4d4d4',
};

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = useCallback((sub: Subscription) => {
    setSubscriptions((prev) => [sub, ...prev]);
  }, []);

  const updateSubscription = useCallback((updated: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Computed values ─────────────────────────────────────────────────────────

  const totalMonthly = useMemo(
    () => subscriptions.reduce((acc, s) => acc + toMonthly(s), 0),
    [subscriptions]
  );

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly]);

  const upcomingRenewals = useMemo(() => {
    const now = dayjs();
    const in30 = now.add(30, 'day');
    return subscriptions
      .filter((s) => {
        if (!s.renewalDate || s.status === 'cancelled') return false;
        const d = dayjs(s.renewalDate);
        return d.isAfter(now) && d.isBefore(in30);
      })
      .sort((a, b) => dayjs(a.renewalDate).valueOf() - dayjs(b.renewalDate).valueOf());
  }, [subscriptions]);

  const categorySpending = useMemo<CategorySpend[]>(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach((s) => {
      const cat = s.category ?? 'Other';
      map[cat] = (map[cat] ?? 0) + toMonthly(s);
    });
    return Object.entries(map)
      .map(([category, monthly]) => ({
        category,
        monthly,
        color: CATEGORY_PALETTE[category] ?? '#d4d4d4',
      }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [subscriptions]);

  // Upcoming cards section (first 3 upcoming renewals, fall back to static)
  const upcomingCards = useMemo(() => {
    if (upcomingRenewals.length > 0) {
      return upcomingRenewals.slice(0, 3).map((s) => ({
        id: s.id,
        icon: s.icon,
        name: s.name,
        price: toMonthly(s),
        currency: s.currency ?? 'INR',
        daysLeft: dayjs(s.renewalDate).diff(dayjs(), 'day'),
      }));
    }
    return UPCOMING_SUBSCRIPTIONS;
  }, [upcomingRenewals]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        removeSubscription,
        totalMonthly,
        totalYearly,
        upcomingRenewals,
        categorySpending,
        upcomingCards,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = (): SubscriptionContextValue => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptions must be used inside <SubscriptionProvider>');
  return ctx;
};
