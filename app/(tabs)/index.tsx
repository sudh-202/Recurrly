import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="home-header">
          <View className="home-user">
            <Image source={images.avatar} className="home-avatar" />
            <Text className="home-user-name">Sudhanshu Bhai</Text>
          </View>
          <TouchableOpacity>
            <Image source={icons.add} className="home-add-icon" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className="home-balance-card">
          <Text className="home-balance-label">Balance</Text>
          <View className="home-balance-row">
            <Text className="home-balance-amount">${HOME_BALANCE.amount.toFixed(2)}</Text>
            <Text className="home-balance-date">04/21</Text>
          </View>
        </View>

        {/* Upcoming Section */}
        <ListHeading title="Upcoming" onPress={() => router.push('/(tabs)/subscriptions')} />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-2"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {UPCOMING_SUBSCRIPTIONS.map((sub) => (
            <UpcomingSubscriptionCard key={sub.id} {...sub} />
          ))}
        </ScrollView>

        {/* All Subscriptions */}
        <ListHeading title="All Subscriptions" onPress={() => router.push('/(tabs)/subscriptions')} />

        <View className="gap-y-4">
          {HOME_SUBSCRIPTIONS.map((sub) => (
            <SubscriptionCard 
              key={sub.id} 
              {...sub} 
              expanded={expandedId === sub.id} 
              isHomeScreen={true}
              onPress={() => setExpandedId(expandedId === sub.id ? null : sub.id)} 
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
