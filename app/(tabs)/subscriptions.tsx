import SubscriptionCard from '@/components/SubscriptionCard';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import { styled } from "nativewind";
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>("github-pro");

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
        <TouchableOpacity className="size-12 items-center justify-center rounded-full border border-black/10 bg-card">
          <Image source={icons.menu} className="size-6" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
      >
        <View className="gap-y-4">
          {HOME_SUBSCRIPTIONS.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              {...sub}
              expanded={expandedId === sub.id}
              onPress={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Subscriptions;