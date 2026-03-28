import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href="/(auth)/sign-in" className="text-xl font-bold text-success bg-primary">
        Sign In
      </Link>
    </View>
  )
}

export default SignUp