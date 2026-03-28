import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Link } from 'expo-router'

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/" className="text-xl font-bold text-success bg-primary">
            Back to Home
      </Link>
    </View>
  )
}

export default SubscriptionDetails