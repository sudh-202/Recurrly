import React from "react";
import { useAuth } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';
import { Redirect, Stack } from 'expo-router'

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const { signUp } = useSignUp()

  if (!isLoaded) {
    return null
  }

  // Don't redirect if a sign-up is in progress (e.g. waiting for email verification)
  const signUpInProgress = signUp?.status && signUp.status !== 'complete'

  if (isSignedIn && !signUpInProgress) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}