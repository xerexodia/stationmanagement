import React from 'react';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {Colors} from '../constants/Colors'; 
import { SafeAreaView } from 'react-native-safe-area-context';


const login = () => {
  const router = useRouter();
  
  const handleGoogleLogin = () => {
    
    console.log('Google login pressed');
  };

  const handleAppleLogin = () => {

    console.log('Apple login pressed');
  };

  const handleFacebookLogin = () => {
    
    console.log('Facebook login pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Text style={styles.logoText}>LOGO</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Google Login Button */}
        <TouchableOpacity 
          style={[styles.button, styles.googleButton]} 
          onPress={handleGoogleLogin}
        >
          <View style={styles.buttonContent}>
            <AntDesign 
              name="google" 
              size={20} 
              color="#4285F4" 
              style={{ marginRight: 12 }}
            />
            <Text style={styles.googleButtonText}>Continue with GOOGLE</Text>
          </View>
        </TouchableOpacity>

        {/* Email Login Button */}
        <TouchableOpacity 
          style={[styles.button, styles.emailButton]} 
          onPress={() => {
            console.log('Email button pressed, navigating to EmailLogin');
            router.push('/EmailLogin');
          }}
        >
          <Text style={styles.emailButtonText}>Continue with EMAIL</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>Or Continue</Text>
        </View>

        {/* Social Media Icons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, styles.appleButton]} 
            onPress={handleAppleLogin}
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, styles.facebookButton]} 
            onPress={handleFacebookLogin}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoBackground: {
    backgroundColor: Colors.logoBackground,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 15,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.logoText,
    letterSpacing: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 50,
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.googleBorder,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkText,
  },
  emailButton: {
    backgroundColor: Colors.emailBackground,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.emailText,
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.divider,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButton: {
    backgroundColor: Colors.apple,
  },
  facebookButton: {
    backgroundColor: Colors.facebook,
  },
});


export default login;