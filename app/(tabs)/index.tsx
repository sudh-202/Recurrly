import "@/global.css"
import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="text-xl font-bold text-success bg-primary">
        Onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="text-xl font-bold text-success bg-primary">
        Sign In
      </Link>
      <Link href="/(auth)/sign-up" className="text-xl font-bold text-success bg-primary">
        Sign Up
      </Link>
      <Link href="/subscriptions/spotify" className="text-xl font-bold text-success bg-primary">
        Spotify
      </Link>
      <Link href={{pathname: "/subscriptions/[id]", params: {id: "netflix"}}} className="text-xl font-bold text-success bg-primary">
        Netflix
      </Link>
    </View>
  );
}