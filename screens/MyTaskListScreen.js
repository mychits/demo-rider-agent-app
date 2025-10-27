import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
  Animated,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";

const COLOR_PALETTE = {
  primary: "#6C2DC7", // Deep violet
  secondary: "#3B1E7A", // Dark violet
  white: "#FFFFFF",
  textDark: "#2C2C2C",
  textLight: "#777777",
  accent: "#8B5CF6", // Soft purple accent
  cardBackground: "#FFFFFF",
  shadowColor: "rgba(0,0,0,0.15)",
};

const headerImage = require("../assets/hero1.jpg");

export default function MyTaskListScreen({ navigation, route }) {
  const { employeeId } = route.params;
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const refreshScale = useRef(new Animated.Value(1)).current;
  const listFadeAnim = useRef(new Animated.Value(0)).current;
  const animatedCardValues = useRef(new Map()).current;

  useEffect(() => {
    fetchTasks();
  }, [employeeId]);

  useEffect(() => {
    if (!loadingTasks && tasks.length > 0) {
      Animated.timing(listFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [loadingTasks, tasks]);

  const handleRefreshPress = () => {
    Animated.sequence([
      Animated.timing(refreshScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(refreshScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      listFadeAnim.setValue(0);
      animatedCardValues.clear();
      fetchTasks();
    });
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await axios.get(`${baseUrl}/task/get-tasks/${employeeId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      Alert.alert("Error", "Could not fetch tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const getAnimatedValue = (taskId, index) => {
    if (!animatedCardValues.has(taskId)) {
      animatedCardValues.set(taskId, new Animated.Value(0));
      Animated.timing(animatedCardValues.get(taskId), {
        toValue: 1,
        duration: 500,
        delay: 50 * index,
        useNativeDriver: true,
      }).start();
    }
    return animatedCardValues.get(taskId);
  };

  const renderTaskItem = ({ item, index }) => {
    const animValue = getAnimatedValue(item._id, index);
    const translateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });
    const opacity = animValue;

    return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Task Detail", { task: item })}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.taskTitle}</Text>
            <Text
              style={[
                styles.cardSubtitle,
                { color: item.status === "Completed" ? COLOR_PALETTE.accent : COLOR_PALETTE.secondary },
              ]}
            >
              Status: {item.status}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={26} color={COLOR_PALETTE.secondary} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLOR_PALETTE.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLOR_PALETTE.primary} />
      {/* Violet Rounded Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
          <Ionicons name="chevron-back" size={32} color={COLOR_PALETTE.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <Image source={headerImage} style={styles.headerImage} />
      </View>

      {/* White Content Section */}
      <KeyboardAvoidingView
        style={styles.contentWrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {loadingTasks ? (
          <ActivityIndicator size="large" color={COLOR_PALETTE.primary} style={{ marginTop: 50 }} />
        ) : tasks.length === 0 ? (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-off-outline"
              size={60}
              color={COLOR_PALETTE.secondary}
            />
            <Text style={styles.noDataText}>No tasks assigned yet.</Text>
            <Animated.View style={{ transform: [{ scale: refreshScale }] }}>
              <TouchableOpacity onPress={handleRefreshPress} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <Animated.FlatList
            data={tasks}
            keyExtractor={(item) => item._id}
            renderItem={renderTaskItem}
            contentContainerStyle={{ paddingBottom: 30 }}
            style={{ opacity: listFadeAnim }}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLOR_PALETTE.primary,
    height: 140,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 60,
  },
  backArrow: { padding: 5 },
  headerTitle: {
    color: COLOR_PALETTE.white,
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLOR_PALETTE.white,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  card: {
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: COLOR_PALETTE.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 6,
    borderColor: COLOR_PALETTE.accent,
  },
  cardContent: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLOR_PALETTE.textDark },
  cardSubtitle: { fontSize: 15, fontWeight: "500", color: COLOR_PALETTE.textLight },
  noDataContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  noDataText: { fontSize: 20, fontWeight: "700", color: COLOR_PALETTE.textDark, marginVertical: 15 },
  refreshButton: {
    backgroundColor: COLOR_PALETTE.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  refreshButtonText: { color: COLOR_PALETTE.white, fontWeight: "bold", fontSize: 16 },
});
