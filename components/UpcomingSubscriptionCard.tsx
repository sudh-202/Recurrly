import React from 'react';
import { View, Text, Image } from 'react-native';

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
}: UpcomingSubscriptionCardProps) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" resizeMode="contain" />
        <View>
          <Text className="upcoming-price">${price.toFixed(2)}</Text>
          <Text className="upcoming-meta">{daysLeft} days left</Text>
        </View>
      </View>
      <Text className="upcoming-name">{name}</Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
