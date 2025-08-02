import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Clear error when component unmounts
  

  // Show error alerts
  

  const handleBack = () => {
    router.back();
  };

  const validateForm = () => {
    // Basic client-side validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!confirmNewPassword.trim()) {
      Alert.alert('Validation Error', 'Please confirm your new password');
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    console.log('=== RESET PASSWORD DEBUG START ===');
    console.log('1. Reset password pressed');
    console.log('2. isSubmitting:', isSubmitting);
    


    

    setIsSubmitting(true);

    try {
      const resetData = {
        email: email.trim().toLowerCase(),
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      };

      console.log('10. Reset data prepared:', {
        email: resetData.email,
        newPassword: '***',
        confirmNewPassword: '***'
      });
      console.log('11. About to call resetPassword function');
      
      // const result = await resetPassword(resetData);
      
      // console.log('12. ResetPassword function returned:', result);

      // if (result.success) {
      //   console.log('13. Password reset successful');
      //   Alert.alert(
      //     'Success',
      //     'Your password has been reset successfully! You can now login with your new password.',
      //     [
      //       {
      //         text: 'Go to Login',
      //         onPress: () => {
      //           console.log('14. Success alert dismissed, navigating to login');
      //           router.push('/login');
      //         },
      //       },
      //     ]
      //   );
      // } else {
      //   console.log('15. Password reset failed:', result.error);
      //   // Error will be displayed by the useEffect that watches the error state
      // }
    } catch (error) {
      console.log('16. ResetPassword threw error:', error);
      Alert.alert('Reset Password Error', 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('17. Setting isSubmitting to false');
      setIsSubmitting(false);
    }
    
    console.log('=== RESET PASSWORD DEBUG END ===');
  };

  // const isFormDisabled = isLoading || isSubmitting;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password</Text>
      </View>

      {/* Form Container */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        
        {/* Security Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="shield-checkmark" size={24} color="#8c4caf" />
          <Text style={styles.infoText}>
            Choose a strong password with at least 6 characters for better security.
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="mail-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        </View>

        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="New Password (minimum 6 characters)"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
            }}
            secureTextEntry={!showNewPassword}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm New Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={(text) => {
              setConfirmNewPassword(text);
            }}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={newPassword.length >= 6 ? "#8c4caf" : "#999"} 
            />
            <Text style={[
              styles.requirementText,
              newPassword.length >= 6 && styles.requirementMet
            ]}>
              At least 6 characters
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={newPassword === confirmNewPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={newPassword === confirmNewPassword && newPassword.length > 0 ? "#8c4caf" : "#999"} 
            />
            <Text style={[
              styles.requirementText,
              newPassword === confirmNewPassword && newPassword.length > 0 && styles.requirementMet
            ]}>
              Passwords match
            </Text>
          </View>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity
          style={[
            styles.resetButton,
          ]}
          onPress={handleResetPassword}
        >
          {/* {isLoading || isSubmitting ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={[
              styles.resetButtonText,
              isFormDisabled && styles.disabledButtonText
            ]}>
              Reset Password
            </Text>
          )} */}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.securityNoteText}>
            Enter the email address associated with your account to reset your password.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.darkText,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: Colors.darkText,
    marginLeft: 15,
    flex: 1,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.darkText,
  },
  passwordToggle: {
    padding: 5,
  },
  requirementsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkText,
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.grey,
    marginLeft: 10,
  },
  requirementMet: {
    color: '#8c4caf',
  },
  resetButton: {
    backgroundColor: Colors.green,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.grey,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: Colors.white,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginBottom: 30,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
});

export default ResetPassword;