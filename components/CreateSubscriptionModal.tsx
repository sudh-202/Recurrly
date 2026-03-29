import { SUBSCRIPTION_CATALOG, findCatalogEntry } from '@/constants/subscription-catalog';
import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
  onClose: () => void;
  onSubmit: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CreateSubscriptionModal = ({ visible, onClose, onSubmit }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  const [category, setCategory] = useState<Category | null>(null);
  const [iconUrl, setIconUrl] = useState('');
  const [iconError, setIconError] = useState(false);
  const [manageUrl, setManageUrl] = useState('');
  const [planUrl, setPlanUrl] = useState('');
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SUBSCRIPTION_CATALOG>([]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory(null);
    setIconUrl('');
    setIconError(false);
    setManageUrl('');
    setPlanUrl('');
    setNameError('');
    setPriceError('');
    setSuggestions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (nameError) setNameError('');

    if (v.trim().length >= 2) {
      const q = v.toLowerCase().trim();
      const matches = SUBSCRIPTION_CATALOG.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.replace(/-/g, ' ').includes(q)
      ).slice(0, 5);
      setSuggestions(matches);

      // Auto-fill instantly on strong single match (name starts with typed text)
      const exactMatch = SUBSCRIPTION_CATALOG.find(
        (e) => e.name.toLowerCase().startsWith(q) || e.id.replace(/-/g, ' ') === q
      );
      if (exactMatch && matches.length === 1) {
        // Only auto-fill icon/urls when unambiguous — don't clobber user-typed icon
        if (!iconUrl || iconError) {
          setIconUrl(exactMatch.logoUrl);
          setIconError(false);
        }
        setManageUrl(exactMatch.manageUrl);
        setPlanUrl(exactMatch.planUrl);
        if (!category) {
          setCategory(
            CATEGORIES.includes(exactMatch.category as Category)
              ? (exactMatch.category as Category)
              : null
          );
        }
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (entry: (typeof SUBSCRIPTION_CATALOG)[number]) => {
    setName(entry.name);
    setIconUrl(entry.logoUrl);
    setIconError(false);
    setManageUrl(entry.manageUrl);
    setPlanUrl(entry.planUrl);
    setCategory(
      CATEGORIES.includes(entry.category as Category)
        ? (entry.category as Category)
        : null
    );
    setSuggestions([]);
  };

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

  const handleSubmit = async () => {
    if (!validate()) return;

    const now = dayjs();
    const renewalDate =
      frequency === 'Yearly'
        ? now.add(1, 'year').toISOString()
        : now.add(1, 'month').toISOString();

    const resolvedCategory: Category = category ?? 'Other';

    // If no icon URL set, try auto-lookup from catalog
    const catalogEntry = findCatalogEntry(name);
    const resolvedIcon =
      iconUrl.trim() && !iconError
        ? { uri: iconUrl.trim() }
        : catalogEntry
        ? { uri: catalogEntry.logoUrl }
        : require('@/assets/icons/wallet.png');

    const subscription: Omit<Subscription, 'id'> = {
      icon: resolvedIcon,
      name: name.trim(),
      plan: `${resolvedCategory} Plan`,
      category: resolvedCategory,
      paymentMethod: undefined,
      status: 'active',
      startDate: now.toISOString(),
      price: parseFloat(parseFloat(price).toFixed(2)),
      currency: 'INR',
      billing: frequency,
      renewalDate,
      color: CATEGORY_COLORS[resolvedCategory],
      manageUrl: manageUrl || catalogEntry?.manageUrl,
      planUrl: planUrl || catalogEntry?.planUrl,
    };

    setSubmitting(true);
    try {
      await onSubmit(subscription);
      resetForm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = !name.trim() || !price.trim() || parseFloat(price) <= 0 || submitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="absolute inset-0" onPress={handleClose} />
          <View className="bg-background rounded-t-[40px] max-h-[90%]">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-border px-8 py-6">
              <Text className="text-2xl font-sans-bold text-primary">New Subscription</Text>
              <TouchableOpacity
                className="size-10 items-center justify-center rounded-full bg-muted"
                onPress={handleClose}
              >
                <Text className="text-2xl font-sans-medium text-primary leading-none">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 32, paddingTop: 24 }}
            >
              <View className="gap-8">
                {/* Icon URL with preview */}
                <View className="gap-2">
                  <Text className="auth-label">
                    Icon URL{' '}
                    <Text className="text-muted-foreground font-sans-medium text-xs">(auto-filled from name)</Text>
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
                        <Text className="text-2xl font-sans-bold text-primary/40">
                          {name.trim().charAt(0).toUpperCase() || '?'}
                        </Text>
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

                {/* Name + autocomplete */}
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
                    onChangeText={handleNameChange}
                  />
                  {!!nameError && <Text className="auth-error">{nameError}</Text>}

                  {/* Autocomplete suggestions */}
                  {suggestions.length > 0 && (
                    <View className="mt-2 rounded-3xl border border-border bg-background overflow-hidden shadow-sm">
                      {suggestions.map((entry, idx) => (
                        <TouchableOpacity
                          key={entry.id}
                          className={`flex-row items-center gap-4 px-5 py-4 ${
                            idx < suggestions.length - 1 ? 'border-b border-border/50' : ''
                          }`}
                          onPress={() => handleSelectSuggestion(entry)}
                        >
                          <View className="size-10 rounded-xl bg-card items-center justify-center overflow-hidden border border-border">
                            <Image
                              source={{ uri: entry.logoUrl }}
                              className="size-8"
                              resizeMode="contain"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-sans-bold text-primary">
                              {entry.name}
                            </Text>
                            <Text className="text-xs font-sans-medium text-muted-foreground">
                              {entry.category}
                            </Text>
                          </View>
                          <Text className="text-xs font-sans-bold text-accent">Fill ↗</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
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

                {/* Billing Frequency */}
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

                {/* Category chips */}
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

                {/* Submit */}
                <TouchableOpacity
                  className={clsx(
                    'h-16 rounded-3xl mt-4 items-center justify-center shadow-lg',
                    isDisabled
                      ? 'bg-primary/20 shadow-none'
                      : 'bg-primary shadow-primary/20'
                  )}
                  onPress={handleSubmit}
                  disabled={isDisabled}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-lg font-sans-extrabold text-white">
                      Add Subscription
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
