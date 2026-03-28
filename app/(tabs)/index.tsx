import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import EditSubscriptionModal from "@/components/EditSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptions } from "@/context/SubscriptionContext";
import "@/global.css";
import { getUserProfileImage } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    removeSubscription,
    totalMonthly,
    upcomingCards,
  } = useSubscriptions();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const profileImage = getUserProfileImage(user);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.emailAddresses[0]?.emailAddress || 'User';

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="home-header">
          <View className="home-user">
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="home-avatar" />
            ) : (
              <Image source={images.avatar} className="home-avatar" />
            )}
            <Text className="home-user-name">{displayName}</Text>
          </View>
          <Pressable onPress={() => setCreateVisible(true)} hitSlop={8}>
            <Image source={icons.add} className="home-add-icon" />
          </Pressable>
        </View>

        {/* Balance Card — real total */}
        <View className="home-balance-card">
          <Text className="home-balance-label">Monthly Total</Text>
          <View className="home-balance-row">
            <Text className="home-balance-amount">₹{totalMonthly.toFixed(2)}</Text>
            <Text className="home-balance-date">
              ₹{(totalMonthly * 12).toFixed(0)}/yr
            </Text>
          </View>
        </View>

        {/* Upcoming Section — real upcoming renewals */}
        <ListHeading title="Upcoming" onPress={() => router.push('/(tabs)/subscriptions')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {upcomingCards.map((sub) => (
            <UpcomingSubscriptionCard key={sub.id} {...sub} />
          ))}
        </ScrollView>

        {/* All Subscriptions */}
        <ListHeading
          title={`All Subscriptions (${subscriptions.length})`}
          onPress={() => router.push('/(tabs)/subscriptions')}
        />

        <View className="gap-y-4">
          {subscriptions.length === 0 && (
            <Text className="home-empty-state">
              No subscriptions yet — tap + to add one.
            </Text>
          )}
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              {...sub}
              expanded={expandedId === sub.id}
              isHomeScreen={true}
              onPress={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              onEditPress={() => { setEditTarget(sub); setExpandedId(null); }}
              onCancelPress={() => handleCancel(sub)}
            />
          ))}
        </View>
      </ScrollView>

      <CreateSubscriptionModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={addSubscription}
      />

      <EditSubscriptionModal
        visible={!!editTarget}
        subscription={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={updateSubscription}
      />
    </SafeAreaView>
  );
}
