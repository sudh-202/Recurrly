import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const SubscriptionCard = ({
  name,
  icon,
  price,
  color,
  expanded,
  onPress,
  plan,
  paymentMethod,
  isCancelling,
  onCancelPress,
  billing,
  startDate,
  isHomeScreen,
}: SubscriptionCardProps) => {
  // Use card color for unexpanded items in Subscriptions screen, otherwise use the specific color
  const bgColor = (isHomeScreen || expanded) ? color : undefined;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`sub-card ${expanded ? 'sub-card-expanded' : ''} ${!bgColor ? 'bg-card' : ''}`}
      style={{ backgroundColor: bgColor, borderColor: bgColor ? "transparent" : undefined }}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" resizeMode="contain" />
          <View className="sub-copy">
            <Text className="sub-title">{name}</Text>
            <Text className="sub-meta">
              {isHomeScreen && !expanded ? (name === "Adobe Creative Cloud" ? "June 25, 12:00" : "June 05, 18:00") : plan}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">${price.toFixed(2)}</Text>
          <Text className="sub-billing">{isHomeScreen && !expanded ? 'per month' : billing || '1 month'}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment info:</Text>
                <Text className="sub-value">
                  {paymentMethod ? `*****${paymentMethod.slice(-4)}` : '*****8530'}
                </Text>
              </View>
              <TouchableOpacity className="list-action">
                <Text className="list-action-text">Manage</Text>
              </TouchableOpacity>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Plan details:</Text>
                <Text className="sub-value">{plan}</Text>
              </View>
              <TouchableOpacity className="list-action">
                <Text className="list-action-text">Change</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity 
            className={`sub-cancel ${isCancelling ? 'sub-cancel-disabled' : ''}`} 
            onPress={onCancelPress} 
            disabled={isCancelling}
          >
            <Text className="sub-cancel-text">
              {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SubscriptionCard;
