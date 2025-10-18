import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import baseUrl from "../constants/baseUrl";

const { width, height } = Dimensions.get("window");

export default function ForgotPassword({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const validatePhoneNumber = () => {
    const isValid = phone.length === 10;
    if (!isValid) {
      Alert.alert("Validation Error", "Please enter a valid phone number.");
    }
    return isValid;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/agent/forgot-password`, {
        phone_number: phone,
      });

      if (response.status === 200) {
        Alert.alert("Success", "OTP has been sent to your phone.");
        setIsOtpSent(true);
      } else {
        Alert.alert("Error", response.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      Alert.alert("Error", "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!phone || !otp) {
      Alert.alert("Validation Error", "Please enter both phone number and OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/agent/verify-otp`, {
        phone_number: phone.trim(),
        otp: otp.trim(),
      });

      if (response.status === 200) {
        Alert.alert("Success", "OTP verified successfully!");
        navigation.navigate("ResetPassword", { mobile: phone });
      } else {
        Alert.alert("Error", response.data?.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error("OTP Verify Error:", error);
      Alert.alert("Error", "An error occurred during OTP verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#5A00E0", "#8B00FF", "#A45CFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, width: "100%" }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Image */}
            <View style={styles.imageContainer}>
              <Image
                source={require("../assets/forgot.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            {/* Card Section */}
            <View style={styles.card}>
              <Text style={styles.title}>
                {isOtpSent ? "Verify OTP" : "Forgot Password"}
              </Text>
              <Text style={styles.subtitle}>
                {isOtpSent
                  ? "Enter the OTP sent to your registered number."
                  : "Enter your registered mobile number to receive OTP."}
              </Text>

              {/* Phone Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#B0AFC1"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  editable={!isOtpSent}
                />
              </View>

              {/* OTP Input */}
              {isOtpSent && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>OTP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#B0AFC1"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
              )}

              {/* Button */}
              <Pressable
                onPress={isOtpSent ? handleVerifyOTP : handleSendOTP}
                style={({ pressed }) => [
                  styles.button,
                  { opacity: pressed || loading ? 0.8 : 1 },
                ]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isOtpSent ? "Verify OTP" : "Send OTP"}
                  </Text>
                )}
              </Pressable>

              {/* Back to login */}
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Back to Login!!</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  image: {
    width: width * 0.8,
    height: width * 0.6,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.2,
    borderColor: "#1C1C1C",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3A0CA3",
    marginBottom: 10,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 25,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    paddingLeft: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1.2,
    borderColor: "#070707ff",
    backgroundColor: "#FAF8FF",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#7B2EFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#7B2EFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  backText: {
    marginTop: 20,
    color: "#5A00E0",
    fontWeight: "600",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
