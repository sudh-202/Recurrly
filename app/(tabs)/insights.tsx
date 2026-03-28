import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { INSIGHTS_DATA, INSIGHTS_HISTORY } from '@/constants/data';
import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <TouchableOpacity className="size-12 items-center justify-center rounded-full border border-black/10 bg-card">
          <Image source={icons.menu} className="size-6" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
      >
        <ListHeading title="Upcoming" onPress={() => router.push('/(tabs)/subscriptions')} />

        {/* Chart Section */}
        <View className="mt-4 rounded-3xl bg-card p-5">
          <View className="flex-row">
            {/* Y-axis labels */}
            <View className="justify-between pr-4" style={{ height: 160 }}>
              {['45', '35', '25', '5', '0'].map((label, i) => (
                <Text key={i} className="text-xs font-sans-medium text-muted-foreground h-4 text-right">
                  {label}
                </Text>
              ))}
            </View>

            {/* Chart Area */}
            <View className="flex-1">
              <View className="relative" style={{ height: 160 }}>
                {/* Grid Lines */}
                <View className="absolute inset-0 justify-between py-2">
                  {[...Array(5)].map((_, i) => (
                    <View key={i} className="h-[1px] w-full border border-dashed border-primary/20" />
                  ))}
                </View>

                {/* Bars Container */}
                <View className="absolute inset-0 flex-row justify-between items-end px-2 py-2">
                  {INSIGHTS_DATA.map((item, index) => {
                    const heightPercentage = (item.value / 45) * 100;
                    return (
                      <View key={index} className="items-center justify-end h-full z-10 w-6">
                        {item.isHighlight && (
                          <View className="absolute items-center z-20 w-12" style={{ bottom: `${heightPercentage}%`, marginBottom: 4 }}>
                            <View className="rounded-full bg-white px-3 py-1 shadow-sm">
                              <Text className="text-[12px] font-sans-bold text-accent">${item.value}</Text>
                            </View>
                            <View className="-mt-1 h-2 w-2 rotate-45 bg-white shadow-sm" />
                          </View>
                        )}
                        <View 
                          className={`w-3 rounded-full ${item.isHighlight ? 'bg-accent' : 'bg-primary'}`}
                          style={{ height: `${heightPercentage}%` }}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* X-axis labels */}
              <View className="flex-row justify-between px-2 mt-2">
                {INSIGHTS_DATA.map((item, index) => (
                  <Text key={index} className="text-xs font-sans-medium text-muted-foreground text-center w-6">
                    {item.day}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Expenses Card */}
        <View className="mt-6 rounded-3xl border border-black/10 bg-background p-5 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-sans-bold text-primary">Expenses</Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">March 2026</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-sans-bold text-primary">-$424.63</Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">+12%</Text>
          </View>
        </View>

        {/* History Section */}
        <View className="mt-2">
          <ListHeading title="History" onPress={() => router.push('/(tabs)/subscriptions')} />
        </View>

        <View className="gap-y-4">
          {INSIGHTS_HISTORY.map((item) => (
            <SubscriptionCard
              key={item.id}
              name={item.name}
              icon={item.icon}
              price={item.price}
              color={item.color}
              billing="Monthly"
              expanded={expandedId === item.id}
              isHomeScreen={true} // to show color background instead of white
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;