import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import { styled } from "nativewind";
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const router = useRouter();
  const { subscriptions, updateSubscription, removeSubscription, totalMonthly } = useSubscriptions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);

  const active = subscriptions.filter((s) => s.status !== 'cancelled');
  const cancelled = subscriptions.filter((s) => s.status === 'cancelled');
  const orderedSubscriptions = useMemo(
    () => [...active, ...cancelled],
    [active, cancelled]
  );

  const handleToggleCancel = (subscription: Subscription) => {
    Alert.alert('Cancel subscription', `Do you really want to cancel your subscription to ${subscription.name}?`, [
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
    ]);
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
        <Text className="text-2xl font-sans-bold text-primary">My Subscriptions</Text>
        <View className="size-12" />
      </View>

      {/* Summary strip */}
      <View className="mx-5 mb-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-card border border-border p-4 items-center">
          <Text className="text-2xl font-sans-extrabold text-primary" numberOfLines={1} adjustsFontSizeToFit>
            {active.length}
          </Text>
          <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Active</Text>
        </View>
        <View className="flex-[1.5] rounded-2xl bg-accent/10 border border-accent/20 p-4 items-center justify-center">
          <Text className="text-2xl font-sans-extrabold text-accent" numberOfLines={1} adjustsFontSizeToFit>
            ₹{totalMonthly.toFixed(0)}
          </Text>
          <Text className="text-xs font-sans-medium text-accent/70 mt-0.5" numberOfLines={1}>/ month</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-card border border-border p-4 items-center">
          <Text className="text-2xl font-sans-extrabold text-primary" numberOfLines={1} adjustsFontSizeToFit>
            {cancelled.length}
          </Text>
          <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">Cancelled</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 4 }}
      >
        <View className="gap-y-4">
          {subscriptions.length === 0 && (
            <Text className="home-empty-state text-center py-10">
              No subscriptions yet — go to Home and tap + to add one.
            </Text>
          )}
          {orderedSubscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              {...sub}
              expanded={expandedId === sub.id}
              onPress={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              onEditPress={() => { setEditTarget(sub); setExpandedId(null); }}
              onCancelPress={() => handleToggleCancel(sub)}
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

export default Subscriptions;
