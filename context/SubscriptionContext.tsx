/**
 * SubscriptionContext
 * Global shared state for subscriptions — used by all tab screens.
 * Fetches from the Recurly backend API and syncs all changes.
 */

import { icons } from '@/constants/icons';
import { useAuth } from '@clerk/expo';
import dayjs from 'dayjs';
import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategorySpend {
  category: string;
  category_slug?: string;
  monthly: number;
  color: string;
}

export interface SubscriptionContextValue {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (sub: Subscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  totalMonthly: number;
  totalYearly: number;
  upcomingRenewals: Subscription[];
  categorySpending: CategorySpend[];
  upcomingCards: UpcomingSubscription[];
  loading: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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

// Map DB category rows to Subscription shape
function mapCategoryRow(row: any): CategorySpend {
  return {
    category: row.category,
    category_slug: row.category_slug,
    monthly: parseFloat(row.total_price) || 0,
    color: CATEGORY_PALETTE[row.category] ?? '#d4d4d4',
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getToken } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscriptions from the backend
  const fetchSubscriptions = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return; // Wait until authenticated
      
      const res = await fetch(`${API_URL}/api/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Map DB rows → Subscription shape
      const mapped: Subscription[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: icons[row.category_slug as keyof typeof icons] ?? icons.wallet,
        category: row.category,
        color: row.category_color ?? CATEGORY_PALETTE[row.category] ?? '#d4d4d4',
        plan: row.plan,
        billing: row.billing,
        price: parseFloat(row.price),
        currency: row.currency,
        status: row.status,
        renewalDate: row.renewal_date,
        startDate: row.start_date,
        manageUrl: row.manage_url,
        planUrl: row.plan_url,
      }));

      setSubscriptions(mapped);
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch from API:', err);
      setError('Using offline data');
      // On error, we keep whatever subscriptions we have (or empty)
      // We removed the HOME_SUBSCRIPTIONS fallback to avoid pre-rendered data for new users
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const addSubscription = useCallback(async (sub: Omit<Subscription, 'id'>) => {
    try {
      const token = await getToken();

      // Extract icon URL string from ImageSourcePropType
      const iconName =
        sub.icon && typeof sub.icon === 'object' && 'uri' in sub.icon
          ? (sub.icon as { uri: string }).uri
          : 'wallet';

      // Transform camelCase Subscription → snake_case backend payload
      const payload = {
        name: sub.name,
        icon_name: iconName,
        category: sub.category,
        plan: sub.plan,
        billing: sub.billing,
        price: sub.price,
        currency: sub.currency ?? 'INR',
        renewal_date: sub.renewalDate,
        start_date: sub.startDate,
        manage_url: sub.manageUrl,
        plan_url: sub.planUrl,
      };

      const res = await fetch(`${API_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: any = await res.json();
      const mapped: Subscription = {
        id: created.id,
        name: created.name,
        icon: icons[created.category_slug as keyof typeof icons] ?? icons.wallet,
        category: created.category,
        color: created.category_color ?? CATEGORY_PALETTE[created.category] ?? '#d4d4d4',
        plan: created.plan,
        billing: created.billing,
        price: parseFloat(created.price),
        currency: created.currency,
        status: created.status,
        renewalDate: created.renewal_date,
        startDate: created.start_date,
        manageUrl: created.manage_url,
        planUrl: created.plan_url,
      };
      setSubscriptions((prev) => [mapped, ...prev]);
    } catch (err) {
      console.error('addSubscription failed:', err);
      throw err;
    }
  }, [getToken]);

  const updateSubscription = useCallback(async (updated: Subscription) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/subscriptions/${updated.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } catch (err) {
      console.error('updateSubscription failed:', err);
      throw err;
    }
  }, [getToken]);

  const removeSubscription = useCallback(async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('removeSubscription failed:', err);
      throw err;
    }
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
    const map: Record<string, CategorySpend> = {};
    subscriptions.forEach((s) => {
      const cat = s.category ?? 'Other';
      if (!map[cat]) {
        map[cat] = { category: cat, monthly: 0, color: CATEGORY_PALETTE[cat] ?? '#d4d4d4' };
      }
      map[cat].monthly += toMonthly(s);
    });
    return Object.values(map).sort((a, b) => b.monthly - a.monthly);
  }, [subscriptions]);

  const upcomingCards = useMemo<UpcomingSubscription[]>(() => {
    return upcomingRenewals.slice(0, 3).map((s) => ({
      id: s.id,
      icon: s.icon,
      name: s.name,
      price: toMonthly(s),
      currency: s.currency ?? 'INR',
      daysLeft: Math.max(1, dayjs(s.renewalDate).diff(dayjs(), 'day')),
    }));
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
        loading,
        error,
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
