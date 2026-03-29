import { useSignIn } from '@clerk/expo';
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Sign In Error', 'Sign-in attempt not complete. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid email or password.';
      setErrorMsg(msg);
      Alert.alert('Sign In Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
        <View className="auth-content justify-center pb-20">
          <View className="auth-brand-block mb-10">
            <View className="auth-logo-wrap mb-10">
              <View className="auth-logo-mark rounded-bl-xl rounded-tr-xl rounded-br-none rounded-tl-xl bg-accent p-2 w-16 h-16 items-center justify-center">
                <Text className="text-white text-3xl font-sans-extrabold">R</Text>
              </View>
              <View>
                <Text className="text-3xl font-sans-extrabold">Recurly</Text>
                <Text className="auth-wordmark-sub">SMART BILLING</Text>
              </View>
            </View>

            <Text className="mb-2 text-center text-3xl font-sans-bold text-primary">Welcome back</Text>
            <Text className="text-center text-base font-sans-medium text-primary/60">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          <View className="auth-card mx-5 rounded-3xl border border-black/10 bg-[#fdf5e6] p-6 shadow-sm">
            <View className="gap-y-5">
              <View>
                <Text className="text-base font-sans-bold text-primary mb-2">Email</Text>
                <TextInput
                  className="bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-base font-sans-bold text-primary mb-2">Password</Text>
                <TextInput
                  className="bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {errorMsg ? (
                <Text className="text-red-500 text-sm font-sans-medium">{errorMsg}</Text>
              ) : null}

              <TouchableOpacity 
                className={`bg-accent rounded-2xl py-4 items-center mt-2 ${(!emailAddress || !password || loading) ? 'opacity-50' : ''}`}
                onPress={handleSubmit}
                disabled={!emailAddress || !password || loading}
              >
                <Text className="text-white text-lg font-sans-bold">
                  {loading ? 'Signing in...' : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-6 flex-row justify-center">
              <Text className="text-base font-sans-medium text-primary/60">New to Recurly? </Text>
              <Text 
                className="text-base font-sans-bold text-accent"
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