import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link href="/(auth)/sign-up" className="text-xl font-bold text-success bg-primary">
        Create an account
      </Link>
    </View>
  )
}

export default SignIn