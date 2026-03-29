import { useSignIn } from '@clerk/expo/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type Screen = 'signin' | 'forgot-email' | 'forgot-code';

const SignIn = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [screen, setScreen] = useState<Screen>('signin');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  const handleSendResetCode = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: resetEmail,
      });
      setScreen('forgot-code');
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Failed to send reset code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      } as any);

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Reset failed. Check your code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const Brand = () => (
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
    </View>
  );

  // ── Forgot Password: Enter email ────────────────────────────
  if (screen === 'forgot-email') {
    return (
      <SafeAreaView className="auth-safe-area" edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
          <View className="auth-content justify-center pb-20">
            <Brand />
            <View className="auth-card mx-5 rounded-3xl border border-black/10 bg-[#fdf5e6] p-6 shadow-sm">
              <Text className="mb-1 text-center text-2xl font-sans-bold text-primary">Reset Password</Text>
              <Text className="mb-6 text-center text-sm font-sans-medium text-primary/60">
                Enter your email to receive a reset code
              </Text>
              <View className="gap-y-5">
                <View>
                  <Text className="text-base font-sans-bold text-primary mb-2">Email</Text>
                  <TextInput
                    className="bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                    style={{ color: '#081126' }}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                  />
                </View>
                {errorMsg ? <Text className="text-red-500 text-sm font-sans-medium">{errorMsg}</Text> : null}
                <TouchableOpacity
                  className={`bg-accent rounded-2xl py-4 items-center mt-2 ${(!resetEmail || loading) ? 'opacity-50' : ''}`}
                  onPress={handleSendResetCode}
                  disabled={!resetEmail || loading}
                >
                  <Text className="text-white text-lg font-sans-bold">
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setScreen('signin'); setErrorMsg(''); }}>
                  <Text className="text-center text-base font-sans-bold text-accent">Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Forgot Password: Enter code + new password ──────────────
  if (screen === 'forgot-code') {
    return (
      <SafeAreaView className="auth-safe-area" edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
          <View className="auth-content justify-center pb-20">
            <Brand />
            <View className="auth-card mx-5 rounded-3xl border border-black/10 bg-[#fdf5e6] p-6 shadow-sm">
              <Text className="mb-1 text-center text-2xl font-sans-bold text-primary">Enter Reset Code</Text>
              <Text className="mb-6 text-center text-sm font-sans-medium text-primary/60">
                Check {resetEmail} for your code
              </Text>
              <View className="gap-y-5">
                <View>
                  <Text className="text-base font-sans-bold text-primary mb-2">Reset Code</Text>
                  <TextInput
                    className="bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                    style={{ color: '#081126' }}
                    placeholder="6-digit code"
                    placeholderTextColor="#999"
                    value={resetCode}
                    onChangeText={setResetCode}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                  />
                </View>
                <View>
                  <Text className="text-base font-sans-bold text-primary mb-2">New Password</Text>
                  <View className="flex-row items-center border border-black/10 rounded-2xl px-4 bg-transparent">
                    <TextInput
                      className="flex-1 py-4 text-base font-sans-medium"
                      style={{ color: '#081126' }}
                      placeholder="Enter new password"
                      placeholderTextColor="#999"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(v => !v)} className="pl-2">
                      <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                </View>
                {errorMsg ? <Text className="text-red-500 text-sm font-sans-medium">{errorMsg}</Text> : null}
                <TouchableOpacity
                  className={`bg-accent rounded-2xl py-4 items-center mt-2 ${(!resetCode || !newPassword || loading) ? 'opacity-50' : ''}`}
                  onPress={handleResetPassword}
                  disabled={!resetCode || !newPassword || loading}
                >
                  <Text className="text-white text-lg font-sans-bold">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setScreen('forgot-email'); setErrorMsg(''); }}>
                  <Text className="text-center text-base font-sans-bold text-accent">Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Sign In ─────────────────────────────────────────────────
  return (
    <SafeAreaView className="auth-safe-area" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
        <View className="auth-content justify-center pb-20">
          <Brand />

          <View className="mb-6">
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
                  style={{ color: '#081126' }}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-base font-sans-bold text-primary mb-2">Password</Text>
                <View className="flex-row items-center border border-black/10 rounded-2xl px-4 bg-transparent">
                  <TextInput
                    className="flex-1 py-4 text-base font-sans-medium"
                    style={{ color: '#081126' }}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} className="pl-2">
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="mt-2 self-end"
                  onPress={() => { setScreen('forgot-email'); setErrorMsg(''); setResetEmail(emailAddress); }}
                >
                  <Text className="text-sm font-sans-bold text-accent">Forgot password?</Text>
                </TouchableOpacity>
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
