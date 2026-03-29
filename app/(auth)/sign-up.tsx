import { PROFILE_AVATARS } from '@/constants/data';
import { useClerk } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  const router = useRouter();
  const clerk = useClerk();
  const { isLoaded, signUp, setActive } = useSignUp();
  
  const [firstName, setFirstName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarUri, setUploadedAvatarUri] = useState<string | null>(null);
  const [uploadedAvatarDataUri, setUploadedAvatarDataUri] = useState<string | null>(null);

  const previewAvatar = uploadedAvatarUri || selectedAvatarUrl;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to upload your profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';

    setSelectedAvatarUrl(null);
    setUploadedAvatarUri(asset.uri);
    setUploadedAvatarDataUri(asset.base64 ? `data:${mimeType};base64,${asset.base64}` : null);
  };

  const handleSelectPreset = (avatarUrl: string) => {
    setSelectedAvatarUrl(avatarUrl);
    setUploadedAvatarUri(null);
    setUploadedAvatarDataUri(null);
  };

  const handleSubmit = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      await signUp.create({
        firstName,
        emailAddress,
        password,
        unsafeMetadata: selectedAvatarUrl ? { avatarUrl: selectedAvatarUrl } : undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Something went wrong.';
      setErrorMsg(msg);
      Alert.alert('Sign Up Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        if (uploadedAvatarDataUri && clerk.user) {
          await clerk.user.setProfileImage({ file: uploadedAvatarDataUri });
          await clerk.user.reload();
        }
        router.replace('/(tabs)');
      } else if (result.status === 'missing_requirements') {
        const missing = result.missingFields?.join(', ') || 'unknown';
        const msg = `Still missing: ${missing}. Please add these fields to the sign-up form or set them as Optional in your Clerk Dashboard.`;
        setErrorMsg(msg);
        Alert.alert('Missing Info', msg);
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid code. Try again.';
      setErrorMsg(msg);
      Alert.alert('Verification Error', msg);
    } finally {
      setLoading(false);
    }
  };


  const handleResend = async () => {
    if (!isLoaded || !signUp) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setCode('');
      Alert.alert('Code sent!', 'A new verification code has been sent to your email.');
    } catch {
      Alert.alert('Error', 'Failed to resend code.');
    }
  };

  // Verification screen
  if (pendingVerification) {
    return (
      <SafeAreaView className="auth-safe-area" edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
          <View className="auth-content justify-center pb-20">
            <View className="auth-brand-block mb-10 items-center">
              <View className="flex-row items-center gap-2 mb-10">
                <View className="rounded-2xl bg-accent w-12 h-12 items-center justify-center">
                  <Text className="text-white text-2xl font-sans-bold">R</Text>
                </View>
                <View>
                  <Text className="text-2xl font-sans-bold text-primary">Recurrly</Text>
                  <Text className="text-[10px] tracking-wider text-primary/60">SUBSCRIPTIONS</Text>
                </View>
              </View>

              <Text className="mb-2 text-center text-3xl font-sans-bold text-primary">
                Verify your email
              </Text>
              <Text className="text-center text-base font-sans-medium text-primary/60 px-10">
                We sent a verification code to{'\n'}{emailAddress}
              </Text>
            </View>

            <View className="mx-5 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
              <View className="gap-y-5">
                <View>
                  <Text className="text-sm font-sans-bold text-primary mb-2">Verification Code</Text>
                  <TextInput
                    className="bg-[#fdfaf5] border border-black/5 rounded-2xl px-4 py-4 text-base font-sans-medium"
                    style={{ color: '#081126' }}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#999"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                  />
                  {errorMsg ? (
                    <Text className="text-red-500 text-xs mt-2 font-sans-medium">{errorMsg}</Text>
                  ) : null}
                </View>
                
                <TouchableOpacity 
                  className={`bg-[#f4b6a8] rounded-2xl py-4 items-center ${(loading || code.length !== 6) ? 'opacity-70' : ''}`}
                  onPress={handleVerify}
                  disabled={loading || code.length !== 6}
                >
                  <Text className="text-[#4a2e2a] text-base font-sans-bold">
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-[#fcf3ef] rounded-2xl py-4 items-center"
                  onPress={handleResend}
                >
                  <Text className="text-[#e28d7a] text-base font-sans-bold">Resend Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Sign-up form
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

            <Text className="mb-2 text-center text-3xl font-sans-bold text-primary">Create Account</Text>
            <Text className="text-center text-base font-sans-medium text-primary/60">
              Sign up to start managing your subscriptions
            </Text>
          </View>

          <View className="auth-card mx-5 rounded-3xl border border-black/10 bg-[#fdf5e6] p-6 shadow-sm">
            <View className="gap-y-5">
              <View className="items-center gap-y-4">
                <View className="size-24 overflow-hidden rounded-full border border-black/10 bg-white items-center justify-center">
                  {previewAvatar ? (
                    <Image source={{ uri: previewAvatar }} className="size-24" />
                  ) : (
                    <Text className="text-3xl font-sans-extrabold text-primary/40">
                      {firstName.trim().charAt(0).toUpperCase() || 'R'}
                    </Text>
                  )}
                </View>
                <TouchableOpacity className="auth-secondary-button w-full" onPress={handlePickImage}>
                  <Text className="auth-secondary-button-text">Upload from device</Text>
                </TouchableOpacity>
                <View className="w-full">
                  <Text className="text-base font-sans-bold text-primary mb-3">Choose a fun avatar</Text>
                  <View className="flex-row flex-wrap justify-between gap-y-3">
                    {PROFILE_AVATARS.map((avatar) => {
                      const isActive = selectedAvatarUrl === avatar.uri;
                      return (
                        <TouchableOpacity
                          key={avatar.id}
                          className={`w-[48%] rounded-2xl border p-3 items-center ${isActive ? 'border-accent bg-accent/10' : 'border-black/10 bg-white/70'}`}
                          onPress={() => handleSelectPreset(avatar.uri)}
                        >
                          <Image source={{ uri: avatar.uri }} className="mb-2 size-16 rounded-2xl" />
                          <Text className={`font-sans-bold ${isActive ? 'text-accent' : 'text-primary'}`}>{avatar.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-base font-sans-bold text-primary mb-2">Full Name</Text>
                <TextInput
                  className="bg-transparent border border-black/10 rounded-2xl px-4 py-4 text-base font-sans-medium"
                  style={{ color: '#081126' }}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

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
              </View>

              {errorMsg ? (
                <Text className="text-red-500 text-sm font-sans-medium">{errorMsg}</Text>
              ) : null}

              <TouchableOpacity 
                className={`bg-accent rounded-2xl py-4 items-center mt-2 ${(!firstName || !emailAddress || !password || loading) ? 'opacity-50' : ''}`}
                onPress={handleSubmit}
                disabled={!firstName || !emailAddress || !password || loading}
              >
                <Text className="text-white text-lg font-sans-bold">
                  {loading ? 'Signing up...' : 'Sign up'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-6 flex-row justify-center">
              <Text className="text-base font-sans-medium text-primary/60">Already have an account? </Text>
              <Text 
                className="text-base font-sans-bold text-accent"
                onPress={() => router.push('/(auth)/sign-in')}
              >
                Sign in
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
