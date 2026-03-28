import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter as useExpoRouter } from "expo-router";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const router = useExpoRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView className="auth-safe-area" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
        <View className="auth-content justify-center pb-20">
          {/* Logo & Brand */}
          <View className="auth-brand-block mb-10">
            <View className="auth-logo-wrap mb-10">
              <View className="auth-logo-mark rounded-bl-xl rounded-tr-xl rounded-br-none rounded-tl-xl bg-accent p-2 w-16 h-16 items-center justify-center">
                <Text className="auth-logo-mark-text text-white text-3xl font-sans-extrabold">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark text-3xl font-sans-extrabold">Recurly</Text>
                <Text className="auth-wordmark-sub">SMART BILLING</Text>
              </View>
            </View>

            <Text className="auth-title mb-2 text-center text-3xl font-sans-bold text-primary">Welcome back</Text>
            <Text className="auth-subtitle text-center text-base font-sans-medium text-primary/60">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          {/* Form Card */}
          <View className="auth-card mx-5 rounded-3xl border border-black/10 bg-[#fdf5e6] p-6 shadow-sm">
            <View className="auth-form gap-y-5">
              <View className="auth-field">
                <Text className="auth-label text-base font-sans-bold text-primary mb-2">Email</Text>
                <TextInput
                  className="auth-input bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label text-base font-sans-bold text-primary mb-2">Password</Text>
                <TextInput
                  className="auth-input bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                className="auth-button bg-accent rounded-2xl py-4 items-center mt-2"
                onPress={() => router.push('/(tabs)')}
              >
                <Text className="auth-button-text text-white text-lg font-sans-bold">Sign in</Text>
              </TouchableOpacity>
            </View>

            <View className="auth-link-row mt-6 flex-row justify-center">
              <Text className="auth-link-copy text-base font-sans-medium text-primary/60">
                New to Recurly?{' '}
              </Text>
              <Text 
                className="auth-link text-base font-sans-bold text-accent"
                onPress={() => router.push('/(auth)/sign-up')}
              >
                Create an account
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;