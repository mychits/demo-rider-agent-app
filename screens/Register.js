import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import baseUrl from "../constants/baseUrl";

const { width: screenWidth } = Dimensions.get("window");

const COLORS = {
  violetDark: "#3C096C",
  violet: "#5A189A",
  violetLight: "#9D4EDD",
  background: "#F8F5FF",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#A0A0A0",
};

const Toast = React.forwardRef(({ duration = 2000 }, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const opacity = useRef(new Animated.Value(0)).current;

  React.useImperativeHandle(ref, () => ({
    show: (msg) => {
      setMessage(msg);
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setVisible(false);
            setMessage("");
          });
        }, duration);
      });
    },
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <View style={styles.toastContent}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
});

export default function Register() {
  const navigation = useNavigation();
  const toastRef = useRef();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const showAppToast = (message) => {
    toastRef.current?.show(message);
  };

  const onPressInButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleRegister = async () => {
    if (!fullName || !phoneNumber || !password || !confirmPassword) {
      showAppToast("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      showAppToast("Passwords do not match");
      return;
    }
    if (phoneNumber.length !== 10 || isNaN(phoneNumber)) {
      showAppToast("Enter a valid 10-digit number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/agent/signup-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phoneNumber,
          password,
          track_source: "mobile",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showAppToast("Registration Successful!");
        setTimeout(() => navigation.navigate("Login"), 1500);
      } else {
        showAppToast(data.message || "Registration failed");
      }
    } catch (error) {
      showAppToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.violetLight, COLORS.violet, COLORS.violetDark]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join and experience smooth, secure transactions
            </Text>

            {/* Full Name */}
            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: inputAnim,
                  transform: [
                    {
                      translateY: inputAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.violet} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.gray}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </Animated.View>

            {/* Phone Number */}
            <Animated.View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={COLORS.violet} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, ""))}
                />
              </View>
            </Animated.View>

            {/* Password */}
            <Animated.View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.violet} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.gray}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.violet}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Confirm Password */}
            <Animated.View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.violet} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={COLORS.gray}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.violet}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Register Button */}
            <Animated.View
              style={[
                styles.registerButtonWrapper,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                onPress={handleRegister}
                onPressIn={onPressInButton}
                onPressOut={onPressOutButton}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.violetLight, COLORS.violetDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.registerButton}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.registerButtonText}>Register</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Login Link */}
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLink}>Login!!</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Toast ref={toastRef} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 6,
    marginLeft: 5,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 55,
    borderWidth: 1,
    borderColor: COLORS.black,
    shadowColor: COLORS.black,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "500",
  },
  registerButtonWrapper: {
    marginTop: 30,
    borderRadius: 30,
    overflow: "hidden",
    alignSelf: "center",
  },
  registerButton: {
    height: 55,
    width: screenWidth * 0.7,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    shadowColor: COLORS.black,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  registerButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  loginText: {
    color: COLORS.white,
    textAlign: "center",
    marginTop: 25,
    fontSize: 15,
  },
  loginLink: {
    color:"red",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  toastContainer: {
    position: "absolute",
    top: 60,
    left: "8%",
    right: "8%",
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: COLORS.violetDark,
    fontWeight: "600",
  },
});
