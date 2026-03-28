import React from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';

const openUrl = (url?: string) => {
  if (url) Linking.openURL(url).catch(() => {});
};

const SubscriptionCard = ({
  name,
  icon,
  price,
  color,
  expanded,
  onPress,
  plan,
  paymentMethod,
  status,
  isCancelling,
  onCancelPress,
  onEditPress,
  billing,
  manageUrl,
  planUrl,
  isHomeScreen,
}: SubscriptionCardProps) => {
  const bgColor = (isHomeScreen || expanded) ? color : undefined;
  const cancelLabel = status === 'cancelled' ? 'Restore' : 'Cancel';

  return (
    <View
      className={`sub-card ${expanded ? 'sub-card-expanded' : ''} ${!bgColor ? 'bg-card' : ''}`}
      style={{ backgroundColor: bgColor, borderColor: bgColor ? 'transparent' : undefined }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View className="sub-head">
          <View className="sub-main">
            <View className="sub-icon items-center justify-center overflow-hidden rounded-2xl bg-card">
              <Image source={icon} className="size-10" resizeMode="contain" />
            </View>
            <View className="sub-copy">
              <Text className="sub-title">{name}</Text>
              <Text className="sub-meta">
                {isHomeScreen && !expanded
                  ? billing === 'Yearly' ? 'Yearly plan' : 'Monthly plan'
                  : plan ?? billing}
              </Text>
            </View>
          </View>
          <View className="sub-price-box">
            <Text className="sub-price">₹{price.toFixed(2)}</Text>
            <Text className="sub-billing">
              {isHomeScreen && !expanded ? 'per month' : billing ?? '1 month'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

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
              <TouchableOpacity
                className="list-action"
                onPress={() => openUrl(manageUrl)}
              >
                <Text className="list-action-text">Manage</Text>
              </TouchableOpacity>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Plan details:</Text>
                <Text className="sub-value">{plan ?? 'Standard Plan'}</Text>
              </View>
              <TouchableOpacity
                className="list-action"
                onPress={() => openUrl(planUrl)}
              >
                <Text className="list-action-text">Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Edit / Cancel */}
          <View className="flex-row gap-3">
            {onEditPress && (
              <TouchableOpacity
                className="flex-1 items-center rounded-full border border-primary/30 bg-white/60 py-4"
                onPress={onEditPress}
              >
                <Text className="font-sans-bold text-primary">Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className={`sub-cancel ${onEditPress ? 'flex-1' : ''} ${isCancelling ? 'sub-cancel-disabled' : ''}`}
              onPress={onCancelPress}
              disabled={isCancelling}
            >
              <Text className="sub-cancel-text">
                {isCancelling ? 'Cancelling…' : cancelLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default SubscriptionCard;
