import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../context/UserContext";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [region, setRegion] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useSession();

  const handleBack = () => {
    router.back();
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "Please enter your first name");
      return false;
    }

    if (!lastName.trim()) {
      Alert.alert("Validation Error", "Please enter your last name");
      return false;
    }

    if (!username.trim()) {
      Alert.alert("Validation Error", "Please enter a username");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email address");
      return false;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter a password");
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters long"
      );
      return false;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Validation Error", "Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return false;
    }

    if (!region.trim()) {
      Alert.alert("Validation Error", "Please enter your region");
      return false;
    }

    if (!acceptTerms) {
      Alert.alert("Validation Error", "Please accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        username: username.trim().toLowerCase(),
        password: password,
        email: email.trim().toLowerCase(),
        region: region.trim(),
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client-auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.success && data.data?.token) {
        signIn(data.data.token);
        
      } else {
        Alert.alert(
          "Registration Error",
          data.message || "Registration failed"
        );
      }
    } catch (error) {
      Alert.alert(
        "Registration Error",
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSocialSignUp = (provider: string) => {
    Alert.alert(
      "Social Sign Up",
      `${provider} sign up will be implemented soon.`,
      [{ text: "OK" }]
    );
  };

  const handleTermsPress = () => {
    Alert.alert(
      "Terms & Conditions",
      "Terms and conditions content will be displayed here.",
      [{ text: "OK" }]
    );
  };

  const isFormDisabled = !acceptTerms || isSubmitting;

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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      {/* Form Container */}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* First Name Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="person-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#999"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="person-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#999"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="at-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
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
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
        </View>

        {/* Region Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="location-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Region (e.g., Tunis)"
            value={region}
            onChangeText={setRegion}
            placeholderTextColor="#999"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            disabled={isFormDisabled}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={20} color="#8c4caf" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isFormDisabled}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* Terms and Conditions */}
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAcceptTerms(!acceptTerms)}
          disabled={isSubmitting}
        >
          <View style={styles.checkboxContainer}>
            <Ionicons
              name={acceptTerms ? "checkbox" : "checkbox-outline"}
              size={20}
              color={acceptTerms ? "#8c4caf" : "#999"}
            />
          </View>
          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text style={styles.termsLink} onPress={handleTermsPress}>
              Terms & Conditions
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signUpButton, isFormDisabled && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={isFormDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text
              style={[
                styles.signUpButtonText,
                isFormDisabled && styles.disabledButtonText,
              ]}
            >
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Section */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin} disabled={isSubmitting}>
            <Text style={styles.loginLink}>Login here</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Media Icons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialSignUp("Apple")}
            disabled={isSubmitting}
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => handleSocialSignUp("Facebook")}
            disabled={isSubmitting}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same as in your original code
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
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  termsText: {
    fontSize: 14,
    color: Colors.grey,
    flex: 1,
  },
  termsLink: {
    color: Colors.green,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: Colors.green,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: Colors.grey,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: Colors.white,
  },
  loginContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  loginText: {
    color: Colors.grey,
    fontSize: 14,
    marginBottom: 5,
  },
  loginLink: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grey,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 15,
    color: Colors.grey,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  appleButton: {
    backgroundColor: Colors.apple,
  },
  facebookButton: {
    backgroundColor: Colors.facebook,
  },
});

export default Signup;