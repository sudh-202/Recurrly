import { PROFILE_AVATARS } from '@/constants/data';
import { icons } from '@/constants/icons';
import { formatAccountId, formatJoinDate, getUserProfileImage } from '@/lib/utils';
import { useClerk, useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { styled } from "nativewind";
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState<'edit-profile' | null>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
  const [uploadedAvatarUri, setUploadedAvatarUri] = useState<string | null>(null);
  const [uploadedAvatarDataUri, setUploadedAvatarDataUri] = useState<string | null>(null);
  const profileImage = getUserProfileImage(user);
  const joinedDate = formatJoinDate(user?.createdAt);
  const accountId = formatAccountId(user?.id);
  const previewImage = uploadedAvatarUri || selectedAvatarUrl || profileImage;

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    if (activeSheet !== 'edit-profile') return;

    const currentAvatar = user?.unsafeMetadata?.avatarUrl;
    setSelectedAvatarUrl(typeof currentAvatar === 'string' ? currentAvatar : null);
    setUploadedAvatarUri(null);
    setUploadedAvatarDataUri(null);
  }, [activeSheet, user?.unsafeMetadata]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSavingProfile(true);
      if (uploadedAvatarDataUri) {
        await user.setProfileImage({ file: uploadedAvatarDataUri });
      }

      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...(user.unsafeMetadata ?? {}),
          avatarUrl: uploadedAvatarDataUri ? null : selectedAvatarUrl,
        },
      });

      await user.reload();
      setActiveSheet(null);
      Alert.alert('Profile updated', 'Your profile details have been saved.');
    } catch {
      Alert.alert('Update failed', 'We could not save your profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to update your profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';

    setSelectedAvatarUrl(null);
    setUploadedAvatarUri(asset.uri);
    setUploadedAvatarDataUri(asset.base64 ? `data:${mimeType};base64,${asset.base64}` : null);
  };

  const handleSelectPreset = (avatarUrl: string) => {
    setSelectedAvatarUrl(avatarUrl);
    setUploadedAvatarUri(null);
    setUploadedAvatarDataUri(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity 
          className="size-12 items-center justify-center rounded-full border border-black/10 bg-card"
          onPress={() => router.push('/(tabs)')}
        >
          <Image source={icons.back} className="size-6" resizeMode="contain" />
        </TouchableOpacity>
        <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
        <View className="size-12" />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
      >
        {/* Profile Card */}
        <TouchableOpacity className="rounded-3xl border border-black/10 bg-card p-5 mb-6" onPress={() => setActiveSheet('edit-profile')}>
          <View className="flex-row items-center gap-4">
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                className="size-16 rounded-full" 
              />
            ) : (
              <View className="size-16 rounded-full bg-accent items-center justify-center">
                <Text className="text-2xl font-sans-extrabold text-white">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xl font-sans-bold text-primary">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text className="text-lg font-sans-bold text-primary mb-3">Account</Text>

        <View className="rounded-3xl border border-black/10 bg-card p-5 mb-6 gap-4">
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-base font-sans-medium text-muted-foreground">Account ID</Text>
            <Text className="flex-1 text-right text-base font-sans-semibold text-primary">{accountId}</Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-base font-sans-medium text-muted-foreground">Joined</Text>
            <Text className="text-base font-sans-semibold text-primary">{joinedDate}</Text>
          </View>
        </View>
        
        <View className="rounded-3xl border border-black/10 bg-card overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center justify-between p-4" onPress={() => setActiveSheet('edit-profile')}>
            <Text className="text-base font-sans-medium text-primary">Edit Profile</Text>
            <Text className="text-muted-foreground">›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="rounded-2xl bg-destructive py-4 items-center"
          onPress={handleSignOut}
        >
          <Text className="text-base font-sans-bold text-white">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={!!activeSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveSheet(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="modal-overlay"
          onPress={() => setActiveSheet(null)}
        >
          <TouchableOpacity activeOpacity={1} className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">Edit Profile</Text>
              <TouchableOpacity className="modal-close" onPress={() => setActiveSheet(null)}>
                <Text className="modal-close-text">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeSheet === 'edit-profile' ? (
                <View className="modal-body">
                  <View className="items-center gap-4">
                    <View className="size-24 overflow-hidden rounded-full border border-black/10 bg-card items-center justify-center">
                      {previewImage ? (
                        <Image source={{ uri: previewImage }} className="size-24" />
                      ) : (
                        <Text className="text-3xl font-sans-extrabold text-primary/40">
                          {firstName.trim().charAt(0).toUpperCase() || 'U'}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity className="auth-secondary-button w-full" onPress={handlePickImage}>
                      <Text className="auth-secondary-button-text">Upload from device</Text>
                    </TouchableOpacity>
                    <View className="w-full">
                      <Text className="auth-label mb-3">Choose avatar</Text>
                      <View className="flex-row flex-wrap justify-between gap-y-3">
                        {PROFILE_AVATARS.map((avatar) => {
                          const isActive = selectedAvatarUrl === avatar.uri;
                          return (
                            <TouchableOpacity
                              key={avatar.id}
                              className={`w-[48%] rounded-2xl border p-3 items-center ${isActive ? 'border-accent bg-accent/10' : 'border-black/10 bg-card'}`}
                              onPress={() => handleSelectPreset(avatar.uri)}
                            >
                              <Image source={{ uri: avatar.uri }} className="mb-2 size-16 rounded-2xl" />
                              <Text className={`font-sans-bold ${isActive ? 'text-accent' : 'text-primary'}`}>{avatar.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                  <View className="gap-2">
                    <Text className="auth-label">First Name</Text>
                    <TextInput
                      className="auth-input"
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter first name"
                      placeholderTextColor="#666666"
                    />
                  </View>
                  <View className="gap-2">
                    <Text className="auth-label">Last Name</Text>
                    <TextInput
                      className="auth-input"
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter last name"
                      placeholderTextColor="#666666"
                    />
                  </View>
                  <View className="gap-2">
                    <Text className="auth-label">Email</Text>
                    <View className="auth-input">
                      <Text className="font-sans-medium text-primary">
                        {user?.emailAddresses[0]?.emailAddress ?? 'No email found'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity className={`auth-button ${savingProfile ? 'auth-button-disabled' : ''}`} onPress={handleSaveProfile} disabled={savingProfile}>
                    <Text className="auth-button-text">{savingProfile ? 'Saving...' : 'Save Changes'}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

export default Settings
