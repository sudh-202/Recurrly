import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import { icons } from '@/constants/icons';
import { useSubscriptions } from '@/context/SubscriptionContext';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { styled } from "nativewind";
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const MAX_BAR_HEIGHT = 180; // px

const Insights = () => {
  const router = useRouter();
  const { subscriptions, totalMonthly, categorySpending, updateSubscription, removeSubscription } = useSubscriptions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);

  // Recent subscriptions sorted by startDate desc — used as "history"
  const history = useMemo(() =>
    [...subscriptions]
      .filter((s) => s.startDate)
      .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())
      .slice(0, 5),
    [subscriptions]
  );

  // Build bar chart from categorySpending (top 6 categories like in the image)
  const topCategories = useMemo(() => categorySpending.slice(0, 6), [categorySpending]);

  // Calculate a "nice" maximum boundary for the Y-axis that divides evenly by 4
  const maxSpend = useMemo(() => {
    if (topCategories.length === 0) return 100;
    const rawMax = Math.max(...topCategories.map((item) => item.monthly), 0);
    if (rawMax === 0) return 100;
    
    // Find next nice human-readable number
    const power = Math.floor(Math.log10(rawMax));
    const magnitude = Math.pow(10, power);
    const normalized = rawMax / magnitude;
    
    let niceMultiplier;
    if (normalized <= 1) niceMultiplier = 1;
    else if (normalized <= 2) niceMultiplier = 2;
    else if (normalized <= 4) niceMultiplier = 4;
    else if (normalized <= 5) niceMultiplier = 5;
    else if (normalized <= 8) niceMultiplier = 8;
    else niceMultiplier = 10;
    
    // Ensure we always have some headroom above the highest bar
    const niceMax = niceMultiplier * magnitude;
    return niceMax <= rawMax ? niceMax * 1.25 : niceMax;
  }, [topCategories]);

  const handleCancel = (subscription: Subscription) => {
    Alert.alert(
      'Cancel subscription',
      `Do you really want to cancel your subscription to ${subscription.name}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => {
            removeSubscription(subscription.id);
            setExpandedId(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="size-12 items-center justify-center rounded-full border border-black/10 bg-card"
          onPress={() => router.push('/(tabs)')}
        >
          <Image source={icons.back} className="size-6" resizeMode="contain" />
        </TouchableOpacity>
        <Text className="text-2xl font-sans-bold text-primary">Monthly Insights</Text>
        <View className="size-12" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
      >
        <ListHeading title="Spending" onPress={() => router.push('/(tabs)/subscriptions')} />

        {/* ── Premium Chart Section ── */}
        <View className="mt-2 rounded-[40px] bg-[#FDF1DC] px-4 py-6 shadow-sm overflow-hidden">
          {topCategories.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Text className="text-sm font-sans-medium text-muted-foreground text-center">
                Add subscriptions to see spending insights.
              </Text>
            </View>
          ) : (
            <View className="flex-row items-end flex-nowrap w-full">
              {/* Y-axis labels - Fixed width to prevent overflow */}
              <View className="justify-between pr-4 items-end w-12 shrink-0" style={{ height: MAX_BAR_HEIGHT + 32, paddingBottom: 32 }}>
                {[maxSpend, maxSpend * 0.75, maxSpend * 0.5, maxSpend * 0.25, 0].map((val, i) => (
                  <Text key={i} className="text-xs font-sans-semibold text-primary/50 text-right w-full" numberOfLines={1} adjustsFontSizeToFit>
                    {val.toFixed(0)}
                  </Text>
                ))}
              </View>

              {/* Chart Area */}
              <View className="flex-1 relative shrink" style={{ height: MAX_BAR_HEIGHT + 32 }}>
                {/* Dashed Grid Lines */}
                <View className="absolute inset-0 justify-between pb-[32px] pt-[2px]">
                  {[...Array(5)].map((_, i) => (
                    <View 
                      key={i} 
                      className="h-[1px] w-full border-b border-dashed border-primary/20" 
                    />
                  ))}
                </View>

                {/* Bars and Badges */}
                <View className="absolute inset-0 flex-row justify-between items-end pb-[32px]">
                  {topCategories.map((item, idx) => {
                    const barH = (item.monthly / maxSpend) * MAX_BAR_HEIGHT;
                    const safeBarH = Math.max(16, barH);
                    
                    return (
                      <View key={item.category} className="items-center flex-1">
                        {/* Persistent Amount Indicator */}
                        <View className="absolute items-center z-20" style={{ bottom: safeBarH + 10 }}>
                          <View className="rounded-2xl bg-white px-3 py-1 shadow-sm">
                            <Text className={`text-[11px] font-sans-bold ${idx === 0 ? 'text-accent' : 'text-primary'}`}>
                              ₹{item.monthly.toFixed(0)}
                            </Text>
                          </View>
                          {/* Triangle Pointer */}
                          <View className="-mt-1 h-2 w-2 rotate-45 bg-white shadow-sm" />
                        </View>
                        
                        {/* Detailed Pill Bar */}
                        <View
                          className={`w-[14px] rounded-full ${idx === 0 ? 'bg-[#EB7B54]' : 'bg-[#0E1528]'}`}
                          style={{ height: safeBarH }}
                        />
                        
                        {/* 3-letter Label below the bar */}
                        <Text 
                          numberOfLines={1} 
                          className="absolute -bottom-7 text-sm font-sans-semibold text-primary/80 text-center"
                        >
                          {item.category.substring(0, 3)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Expenses Summary Card */}
        <View className="mt-12 rounded-3xl bg-background p-6 border border-black/5 shadow-sm">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-sans-bold text-primary">March Expenses</Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                Monthly Breakdown
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-sans-extrabold text-primary">₹{totalMonthly.toFixed(2)}</Text>
              <Text className="mt-1 text-xs font-sans-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                ₹{(totalMonthly * 12).toFixed(0)}/yr
              </Text>
            </View>
          </View>

          {/* Category breakdown list */}
          <View className="gap-5">
            {categorySpending.map((item) => {
              const pct = totalMonthly > 0 ? (item.monthly / totalMonthly) * 100 : 0;
              return (
                <View key={item.category}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-sans-bold text-primary">{item.category}</Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-sans-bold text-primary">₹{item.monthly.toFixed(0)}</Text>
                      <Text className="text-[10px] font-sans-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                        {pct.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 rounded-full bg-muted overflow-hidden">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* History Section */}
        <View className="mt-4">
          <ListHeading title="Recent Subscriptions" onPress={() => router.push('/(tabs)/subscriptions')} />
        </View>

        <View className="gap-y-4">
          {history.length === 0 && (
            <Text className="home-empty-state">No subscriptions yet.</Text>
          )}
          {history.map((item) => (
            <SubscriptionCard
              key={item.id}
              {...item}
              expanded={expandedId === item.id}
              isHomeScreen={false} // Use full color in Insights
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onEditPress={() => { setEditTarget(item); setExpandedId(null); }}
              onCancelPress={() => handleCancel(item)}
            />
          ))}
        </View>
      </ScrollView>

      <EditSubscriptionModal
        visible={!!editTarget}
        subscription={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={updateSubscription}
      />
    </SafeAreaView>
  );
};

export default Insights;
