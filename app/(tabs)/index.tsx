import "@/global.css";
import React from "react";
import { Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1  bg-background p-5 ">

      <Text className="text-7xl font-sans-extrabold ">Home</Text>
      <Link
        href="/onboarding"
        className="text-xl font-sans-bold text-white px-5 py-2 my-2 bg-primary"
      >
        Onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="text-xl font-sans-bold px-5 py-2 my-2 text-white bg-primary"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="text-xl font-sans-bold px-5 py-2 my-2 text-white bg-primary"
      >
        Sign Up
      </Link>
      <Link
        href="/subscriptions/spotify"
        className="text-xl font-sans-bold px-5 py-2 my-2 text-white bg-primary"
      >
        Spotify
      </Link>
      <Link
        href={{ pathname: "/subscriptions/[id]", params: { id: "netflix" } }}
        className="text-xl font-sans-bold px-5 py-2 my-2 text-white bg-primary"
      >
        Netflix
      </Link>
    </SafeAreaView>
  );
}
