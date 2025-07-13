import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IoniconName = keyof typeof Ionicons.glyphMap;

const EditProfileScreen = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('Ibty');
  const [lastName, setLastName] = useState('ibtyAccount');
  const [email, setEmail] = useState('ibty@gmail.com');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = () => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleConfirm = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('Profile updated:', { firstName, lastName, email });
    Alert.alert('Success', 'Profile updated successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const bottomTabIcons: { name: IoniconName; screen: string; isActive: boolean }[] = [
    { name: 'car', screen: '/home', isActive: false },
    { name: 'flash', screen: '/reclamation', isActive: false },
    { name: 'ellipse', screen: '/notifications', isActive: false },
    { name: 'person', screen: '/profile', isActive: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Image Section */}
      <View style={styles.profileImageSection}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={handleImageUpload}>
          <View style={styles.profileImageCircle}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Ionicons name="person" size={40} color="#4CAF50" />
              </View>
            )}
          </View>
          <View style={styles.profileImageBorder} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleImageUpload}>
          <Text style={styles.uploadText}>Upload image</Text>
        </TouchableOpacity>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your name</Text>
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#C0C0C0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your surname</Text>
          <TextInput
            style={styles.textInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your surname"
            placeholderTextColor="#C0C0C0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Your contact</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#C0C0C0"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Confirm Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {bottomTabIcons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bottomNavItem, icon.isActive && styles.activeNavItem]}
            onPress={() => router.push(icon.screen)}
          >
            <Ionicons
              name={icon.name}
              size={24}
              color={icon.isActive ? '#4CAF50' : '#666'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  headerSpacer: { width: 40 },
  profileImageSection: { alignItems: 'center', paddingVertical: 30 },
  profileImageContainer: { position: 'relative', marginBottom: 15 },
  profileImageCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 50 },
  defaultProfileImage: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  profileImageBorder: {
    position: 'absolute', top: -3, left: -3, right: -3, bottom: -3,
    borderRadius: 53, borderWidth: 2, borderColor: '#4CAF50',
  },
  uploadText: { fontSize: 16, color: '#666', fontWeight: '500' },
  formSection: { paddingHorizontal: 20, flex: 1 },
  inputGroup: { marginBottom: 25 },
  inputLabel: { fontSize: 14, color: '#4CAF50', marginBottom: 8, fontWeight: '500' },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12,
    paddingHorizontal: 15, paddingVertical: 15, fontSize: 16,
    color: '#333', backgroundColor: '#fff',
  },
  buttonSection: { paddingHorizontal: 20, paddingBottom: 20 },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  bottomNavItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8,
  },
  activeNavItem: {},
});

export default EditProfileScreen;
