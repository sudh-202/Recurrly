import { Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  return (
    <SafeAreaView className="flex-1  bg-background p-5 ">
      <Text>SignIn</Text>
      <Link href="/(auth)/sign-up" className="text-xl font-bold text-success bg-primary">
        Create an account
      </Link>
    </SafeAreaView>
  )
}

export default SignIn