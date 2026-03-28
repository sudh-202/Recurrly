import { icons } from '@/constants/icons';
import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const FREQUENCIES = ['Monthly', 'Yearly'] as const;
type Frequency = (typeof FREQUENCIES)[number];

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#f5c542',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#b8e8d0',
  Productivity: '#ffd5dc',
  Cloud: '#c0aede',
  Music: '#b6e3f4',
  Other: '#d4d4d4',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSave: (updated: Subscription) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toFrequency = (v?: string): Frequency =>
  v === 'Yearly' ? 'Yearly' : 'Monthly';

const toCategory = (v?: string): Category | null =>
  CATEGORIES.includes(v as Category) ? (v as Category) : null;

const getIconUri = (icon: Subscription['icon']): string => {
  if (typeof icon === 'object' && icon !== null && 'uri' in (icon as object)) {
    return (icon as { uri: string }).uri;
  }
  return '';
};

// ─── Component ────────────────────────────────────────────────────────────────

const EditSubscriptionModal = ({ visible, subscription, onClose, onSave }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<Category | null>(null);
  const [iconUrl, setIconUrl] = useState('');
  const [iconError, setIconError] = useState(false);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  // Pre-fill when subscription changes
  useEffect(() => {
    if (subscription) {
      setName(subscription.name ?? '');
      setPrice(subscription.price?.toString() ?? '');
      setFrequency(toFrequency(subscription.billing));
      setCategory(toCategory(subscription.category));
      setIconUrl(getIconUri(subscription.icon));
      setIconError(false);
      setNameError('');
      setPriceError('');
    }
  }, [subscription]);

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Name is required.');
      valid = false;
    } else {
      setNameError('');
    }
    const parsed = parseFloat(price);
    if (!price.trim() || isNaN(parsed) || parsed <= 0) {
      setPriceError('Enter a valid positive price.');
      valid = false;
    } else {
      setPriceError('');
    }
    return valid;
  };

  const handleSave = () => {
    if (!validate() || !subscription) return;

    const resolvedCategory: Category = category ?? 'Other';
    const now = dayjs();
    const renewalDate =
      frequency === 'Yearly'
        ? now.add(1, 'year').toISOString()
        : now.add(1, 'month').toISOString();

    const updated: Subscription = {
      ...subscription,
      name: name.trim(),
      price: parseFloat(parseFloat(price).toFixed(2)),
      billing: frequency,
      category: resolvedCategory,
      color: CATEGORY_COLORS[resolvedCategory],
      renewalDate: subscription.renewalDate ?? renewalDate,
      icon: iconUrl.trim() && !iconError ? { uri: iconUrl.trim() } : subscription.icon,
    };

    onSave(updated);
    onClose();
  };

  const isDisabled = !name.trim() || !price.trim() || parseFloat(price) <= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50 justify-end"
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="bg-background rounded-t-[40px] max-h-[90%]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-border px-8 py-6">
              <Text className="text-2xl font-sans-bold text-primary">Edit Subscription</Text>
              <TouchableOpacity
                className="size-10 items-center justify-center rounded-full bg-muted"
                onPress={onClose}
              >
                <Text className="text-2xl font-sans-medium text-primary leading-none">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 32, paddingTop: 24 }}
            >
              <View className="gap-8">
                {/* Icon URL */}
                <View className="gap-2">
                  <Text className="auth-label">
                    Icon URL{' '}
                    <Text className="text-muted-foreground font-sans-medium text-xs">(optional)</Text>
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <View className="size-16 rounded-2xl border border-border bg-card items-center justify-center overflow-hidden shrink-0">
                      {iconUrl.trim() && !iconError ? (
                        <Image
                          source={{ uri: iconUrl.trim() }}
                          className="size-12"
                          resizeMode="contain"
                          onError={() => setIconError(true)}
                        />
                      ) : (
                        <Image source={icons.wallet} className="size-8" resizeMode="contain" />
                      )}
                    </View>
                    <TextInput
                      className="auth-input flex-1 h-16"
                      placeholder="https://..."
                      placeholderTextColor="#999"
                      value={iconUrl}
                      onChangeText={(v) => {
                        setIconUrl(v);
                        setIconError(false);
                      }}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </View>
                  {iconError && !!iconUrl.trim() && (
                    <Text className="auth-error">Could not load image — check the URL.</Text>
                  )}
                </View>

                {/* Name */}
                <View className="gap-2">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className={clsx(
                      'auth-input h-16',
                      nameError && 'border-destructive'
                    )}
                    placeholder="e.g. Netflix, Notion…"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={(v) => {
                      setName(v);
                      if (nameError) setNameError('');
                    }}
                  />
                  {!!nameError && <Text className="auth-error">{nameError}</Text>}
                </View>

                {/* Price */}
                <View className="gap-2">
                  <Text className="auth-label">Price (₹)</Text>
                  <TextInput
                    className={clsx(
                      'auth-input h-16',
                      priceError && 'border-destructive'
                    )}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    value={price}
                    onChangeText={(v) => {
                      setPrice(v);
                      if (priceError) setPriceError('');
                    }}
                    keyboardType="decimal-pad"
                  />
                  {!!priceError && <Text className="auth-error">{priceError}</Text>}
                </View>

                {/* Frequency */}
                <View className="gap-2">
                  <Text className="auth-label">Billing Frequency</Text>
                  <View className="flex-row gap-4">
                    {FREQUENCIES.map((f) => (
                      <TouchableOpacity
                        key={f}
                        className={clsx(
                          'flex-1 h-16 rounded-2xl border items-center justify-center',
                          frequency === f
                            ? 'bg-accent border-accent shadow-lg shadow-accent/20'
                            : 'bg-card border-border'
                        )}
                        onPress={() => setFrequency(f)}
                      >
                        <Text
                          className={clsx(
                            'text-base font-sans-bold',
                            frequency === f ? 'text-white' : 'text-primary/60'
                          )}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Category */}
                <View className="gap-2">
                  <Text className="auth-label">Category</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        className={clsx(
                          'px-5 py-3 rounded-full border',
                          category === cat
                            ? 'bg-accent/10 border-accent'
                            : 'bg-card border-border'
                        )}
                        onPress={() => setCategory(category === cat ? null : cat)}
                      >
                        <Text
                          className={clsx(
                            'text-sm font-sans-bold',
                            category === cat ? 'text-accent' : 'text-primary/60'
                          )}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Save */}
                <TouchableOpacity
                  className={clsx(
                    'h-16 rounded-3xl mt-4 items-center justify-center shadow-lg',
                    isDisabled
                      ? 'bg-primary/20 shadow-none'
                      : 'bg-primary shadow-primary/20'
                  )}
                  onPress={handleSave}
                  disabled={isDisabled}
                >
                  <Text className="text-lg font-sans-extrabold text-white">
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditSubscriptionModal;
