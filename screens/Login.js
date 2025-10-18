import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseUrl from "../constants/baseUrl";

const { width } = Dimensions.get("window");
const COLOR_PALETTE = {
  primary: "#6C2DC7", // PhonePe main violet
  secondary: "#3B1E7A", // Deep violet
  accent: "#B19CD9", // Soft lavender tone
  textDark: "#000000",
  textLight: "#FFFFFF",
};

export default function Login({ navigation }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogin = async () => {
    if (!mobile || !password) {
      Alert.alert("Error", "Please enter both mobile number and password.");
      return;
    }

    setLoading(true);
    try {
      const cleanedPassword = password.replace(/\s/g, "");
      const response = await fetch(`${baseUrl}/agent/login-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: mobile, password: cleanedPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        const agentDetail = await axios.get(
          `${baseUrl}/agent/get-agent-by-id/${data.userId}`
        );
        await AsyncStorage.setItem("user", JSON.stringify(data));
        await AsyncStorage.setItem("agentInfo", JSON.stringify(agentDetail?.data));
        navigation.navigate("BottomNavigation", {
          user: data,
          agentInfo: agentDetail?.data,
        });
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onPressInButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient
      colors={[COLOR_PALETTE.primary, COLOR_PALETTE.secondary]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* ✅ StatusBar setup for violet background */}
      <StatusBar barStyle="light-content" backgroundColor={COLOR_PALETTE.primary} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {/* ✅ App Logo */}
          <Image
            source={require("../assets/CityChits.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your DemoRider account</Text>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={22} color="#888" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter mobile number"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={mobile}
                onChangeText={setMobile}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={22} color="#888" />
              <TextInput
                style={styles.textInput}
                placeholder="Enter password"
                placeholderTextColor="#888"
                secureTextEntry={!isPasswordShown}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordShown(!isPasswordShown)}>
                <Ionicons
                  name={isPasswordShown ? "eye-off" : "eye"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              style={{ alignSelf: "flex-end", marginTop: 8 }}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleLogin}
              onPressIn={onPressInButton}
              onPressOut={onPressOutButton}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLOR_PALETTE.secondary, COLOR_PALETTE.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Links */}
          <Pressable onPress={() => navigation.navigate("Becomeanagent")}>
            <Text style={styles.agentLink}>Become an Agent?</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerText}>
              Don’t have an account?{" "}
              <Text style={styles.registerLink}>Register!!</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: "#000", // ✅ black border for professional contrast
  },
  logo: {
    width: 250,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLOR_PALETTE.textDark,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    height: 55,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    color: "#000",
    fontSize: 16,
  },
  forgotPassword: {
    color: COLOR_PALETTE.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  buttonWrapper: {
    marginTop: 25,
    marginBottom: 15,
  },
  loginButton: {
    width: width * 0.75,
    alignSelf: "center",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  agentLink: {
    color: COLOR_PALETTE.secondary,
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
    textDecorationLine: "underline",
  },
  registerText: {
    textAlign: "center",
    color: "#000",
    fontSize: 15,
  },
  registerLink: {
    color: COLOR_PALETTE.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
