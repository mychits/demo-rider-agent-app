import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import baseUrl from "../constants/baseUrl";

const { width } = Dimensions.get("window");

const COLORS = {
  violet1: "#6C2DC7",
  violet2: "#83438bff",
  white: "#FFFFFF",
  textDark: "#2C2C2C",
  gray: "#888",
  border: "#E5E5E5",
  shadow: "rgba(0,0,0,0.15)",
  lightViolet: "#B983FF",
};

export default function CompleteTaskScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Completed");
  const [loading, setLoading] = useState(false);

  const toggleStatus = () => {
    setStatus((prev) => {
      switch (prev) {
        case "Completed":
          return "Pending";
        case "Pending":
          return "In Progress";
        case "In Progress":
          return "Completed";
        default:
          return "Completed";
      }
    });
  };

  const handleCompleteTask = async () => {
    if (!message.trim()) {
      Alert.alert("Validation Error", "Please enter a message.");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`${baseUrl}/task/complete-task/${taskId}`, {
        message,
        status,
      });
      Alert.alert("Success", "Task updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Violet Gradient */}
      <LinearGradient
        colors={[COLORS.violet1, COLORS.violet2]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Task</Text>
          <View style={{ width: 35 }} />
        </View>

        {/* Content */}
        <View style={styles.contentArea}>
          <View style={styles.card}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={80}
              color={COLORS.violet1}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.title}>Complete Task</Text>
            <View style={styles.separator} />

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={toggleStatus}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{status}</Text>
                <Ionicons name="caret-down" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Enter message"
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={3}
                style={styles.textInput}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCompleteTask}
              activeOpacity={0.8}
              disabled={loading}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={[COLORS.violet1, COLORS.violet2]}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Submit</Text>
                    <Ionicons
                      name="arrow-forward-circle-outline"
                      size={24}
                      color={COLORS.white}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10, // ✅ Extra spacing below status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    alignItems: "center",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 10, // ✅ Slightly lower white area for cleaner separation
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  separator: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.violet1,
    borderRadius: 2,
    marginBottom: 25,
  },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  textInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.textDark,
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonWrapper: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  submitButton: {
    width: width * 0.7,
    height: 55,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: COLORS.violet2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
});
