import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import images from '@/constants/images';

const SafeAreaView = styled(RNSafeAreaView);
const { width } = Dimensions.get('window');

const Onboarding = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-accent" edges={["top", "bottom"]}>
      <View className="flex-1 justify-between">
        {/* Pattern Background Image */}
        <View className="flex-1 justify-center items-center mt-10">
          <Image 
            source={images.splashPattern} 
            style={{ width: width, height: width * 1.2 }}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Content Area */}
        <View className="px-6 pb-10">
          <Text className="text-4xl font-sans-extrabold text-white text-center mb-2">
            Gain Financial Clarity
          </Text>
          <Text className="text-lg font-sans-medium text-white/90 text-center mb-8">
            Track, analyze and cancel with ease
          </Text>

          <TouchableOpacity 
            className="w-full bg-white rounded-full py-4 items-center"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text className="text-lg font-sans-bold text-primary">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;