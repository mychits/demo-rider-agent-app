import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import baseUrl from "../constants/baseUrl"; // Ensure this path is correct
import axios from "axios";
import COLORS from "../constants/color"; // Keep if you have global color constants
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// PhonePe-like violet palette (adjust if you prefer slightly different purple)
const COLOR_PALETTE = {
  primary: "#5C2AA5", // strong PhonePe violet
  primaryDark: "#4A1F86",
  accent: "#A685FF", // lighter violet accent
  lightText: "#FFFFFF",
  cardBackground: "#FFFFFF",
  errorRed: "#E74C3C",
  greyText: "#4A4A4A",
  softBorder: "#EAE6FB",
  backgroundLight: "#F6F2FF",
  backgroundGradientStart: "#F3EFFF",
  backgroundGradientEnd: "#E6DEFF",
  successGreen: "#27AE60",
};

const backgroundImage = require("../assets/hero1.jpg"); // your background
const headerImage = require("../assets/hero1.jpg"); // your header logo/image

const Target = ({ route, navigation }) => {
  const [targetData, setTargetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Animation values
  const refreshScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const achievedProgress = useRef(new Animated.Value(0)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;

  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

  useEffect(() => {
    fetchTargetDetails();
  }, []);

  useEffect(() => {
    if (targetData) {
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 450,
        delay: 80,
        useNativeDriver: true,
      }).start();

      const progress =
        targetData.total > 0 ? (targetData.achieved / targetData.total) * 100 : 0;
      Animated.timing(achievedProgress, {
        toValue: progress,
        duration: 700,
        delay: 200,
        useNativeDriver: false,
      }).start();

      if (targetData.achieved >= targetData.total) {
        Animated.spring(bannerScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [targetData]);

  const handleRefreshPress = () => {
    Animated.sequence([
      Animated.timing(refreshScale, {
        toValue: 1.12,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(refreshScale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start(() => {
      cardOpacity.setValue(0);
      achievedProgress.setValue(0);
      bannerScale.setValue(0);
      fetchTargetDetails();
    });
  };

  const fetchTargetDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const agentInfoJson = await AsyncStorage.getItem("agentInfo");
      const agentInfo = agentInfoJson ? JSON.parse(agentInfoJson) : null;

      const agentId = agentInfo?._id;
      const designationId = agentInfo?.designation_id;

      if (!agentId) {
        setError("User ID not found in stored information. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${baseUrl}/target/get-targets`, {
        params: {
          fromDate: startOfMonth,
          toDate: endOfMonth,
        },
      });

      const allTargets = res.data || [];
      let selectedTarget = null;

      selectedTarget = allTargets.find(
        (t) => (t.agentId && (t.agentId._id === agentId || t.agentId === agentId))
      );

      if (!selectedTarget && designationId) {
        selectedTarget = allTargets.find(
          (t) =>
            (!t.agentId ||
              t.agentId === null ||
              (typeof t.agentId === "object" && !t.agentId._id)) &&
            t.designationId === designationId
        );
      }

      if (!selectedTarget && allTargets.length > 0) {
        selectedTarget = allTargets[0];
      }

      if (!selectedTarget) {
        setError("No target set for this user for the current period.");
        setTargetData(null);
        setLoading(false);
        return;
      }

      const targetStartDate = moment(selectedTarget.startDate).format("YYYY-MM-DD");
      const targetEndDate = moment(selectedTarget.endDate).format("YYYY-MM-DD");

      const commRes = await axios.get(
        `${baseUrl}/enroll/get-detailed-commission-per-month`,
        {
          params: {
            agent_id: agentId,
            from_date: startOfMonth,
            to_date: endOfMonth,
          },
        }
      );

      const actualBusiness =
        commRes.data?.summary?.actual_business || 0;

      const cleanActual =
        typeof actualBusiness === "string"
          ? Number(actualBusiness.replace(/[^0-9.-]+/g, ""))
          : actualBusiness;

      const totalTarget = selectedTarget.totalTarget || 0;
      const achievedAmount = cleanActual || 0;
      const remainingAmount = totalTarget > achievedAmount ? totalTarget - achievedAmount : 0;

      setTargetData({
        total: totalTarget,
        achieved: achievedAmount,
        remaining: remainingAmount,
        startDate: targetStartDate,
        endDate: targetEndDate,
      });
    } catch (err) {
      console.error("Error fetching target or commission:", err.response?.data || err.message);
      setError("Failed to load data. Please check network or try again.");
      Alert.alert("Error", err.response?.data?.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const isTargetAchieved = targetData && targetData.achieved >= targetData.total;
  const progressPercentage =
    targetData && targetData.total > 0
      ? Math.min(100, (targetData.achieved / targetData.total) * 100)
      : 0;

  const animatedProgressWidth = achievedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle Background Image */}
      <Image
        source={backgroundImage}
        style={styles.backgroundImage}
        blurRadius={Platform.OS === "ios" ? 14 : 6}
      />

      <LinearGradient
        colors={[COLOR_PALETTE.backgroundGradientStart, COLOR_PALETTE.backgroundGradientEnd]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
            <Ionicons name="chevron-back" size={26} color={COLOR_PALETTE.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Performance</Text>

          <Animated.View style={[styles.refreshWrapper, { transform: [{ scale: refreshScale }] }]}>
            <TouchableOpacity onPress={handleRefreshPress} activeOpacity={0.8}>
              <View style={styles.refreshIconContainer}>
                <Feather name="refresh-cw" size={18} color={COLOR_PALETTE.primaryDark} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>My Performance ✨</Text>
            <Text style={styles.subtitle}>
              {moment().format("MMMM YYYY")}
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLOR_PALETTE.primary}
              style={styles.loadingIndicator}
            />
          ) : error ? (
            <View style={styles.errorCard}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={48}
                color={COLOR_PALETTE.errorRed}
              />
              <Text style={styles.errorText}>Oops! {error}</Text>
              <TouchableOpacity onPress={handleRefreshPress} style={styles.errorRefreshButton}>
                <Text style={styles.errorRefreshButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : !targetData ? (
            <View style={styles.noDataCard}>
              <MaterialCommunityIcons
                name="folder-outline"
                size={56}
                color={COLOR_PALETTE.primary}
                style={styles.noDataIcon}
              />
              <Text style={styles.noDataText}>No active target details found for this period.</Text>
              <Text style={styles.noDataSubText}>
                It seems there's no target assigned for you this month. Please check with your administrator if you believe this is an error.
              </Text>
            </View>
          ) : (
            <Animated.ScrollView
              style={[styles.scrollView, { opacity: cardOpacity }]}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Achievement Banner */}
              {isTargetAchieved && (
                <Animated.View style={[styles.achievementBanner, { transform: [{ scale: bannerScale }] }]}>
                  <MaterialCommunityIcons name="medal" size={28} color={COLOR_PALETTE.lightText} />
                  <Text style={styles.achievementText}>Congratulations! Target ACHIEVED 🎉</Text>
                </Animated.View>
              )}

              {/* Period Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar-outline" size={20} color={COLOR_PALETTE.primary} />
                  <Text style={styles.label}>Performance Period</Text>
                </View>
                <Text style={styles.value}>
                  <Text style={{ fontWeight: "700" }}>{targetData.startDate}</Text> to <Text style={{ fontWeight: "700" }}>{targetData.endDate}</Text>
                </Text>
              </View>

              {/* Total Target Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="bullseye-arrow" size={20} color={COLOR_PALETTE.primary} />
                  <Text style={styles.label}>Total Target</Text>
                </View>
                <Text style={styles.value}>₹{Number(targetData.total).toLocaleString("en-IN")}</Text>
              </View>

              {/* Achieved Card + Progress */}
              <View style={[styles.card, isTargetAchieved ? styles.cardAchieved : styles.cardProgress]}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name={isTargetAchieved ? "check-circle-outline" : "chart-line-variant"}
                    size={20}
                    color={isTargetAchieved ? COLOR_PALETTE.successGreen : COLOR_PALETTE.primary}
                  />
                  <Text style={[styles.label, isTargetAchieved && { color: COLOR_PALETTE.successGreen }]}>Achieved Business</Text>
                </View>

                <Text style={[styles.value, isTargetAchieved && { color: COLOR_PALETTE.successGreen }]}>
                  ₹{Number(targetData.achieved).toLocaleString("en-IN")}
                </Text>

                <View style={styles.progressBarBackground}>
                  <Animated.View style={[
                    styles.progressBarFill,
                    {
                      width: animatedProgressWidth,
                      backgroundColor: isTargetAchieved ? COLOR_PALETTE.successGreen : COLOR_PALETTE.accent,
                    }
                  ]} />
                  <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
                </View>
              </View>

              {/* Remaining Card */}
              {!isTargetAchieved && (
                <View style={[styles.card, styles.cardRemaining]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="hourglass-outline" size={20} color={COLOR_PALETTE.primaryDark} />
                    <Text style={[styles.label, { color: COLOR_PALETTE.primaryDark }]}>Remaining to Achieve</Text>
                  </View>

                  <Text style={[styles.value, { color: COLOR_PALETTE.primaryDark }]}>
                    ₹{Number(targetData.remaining).toLocaleString("en-IN")}
                  </Text>

                  {targetData.achieved === 0 ? (
                    <Text style={styles.motivationText}>Keep going — small steps every day add up! ✨</Text>
                  ) : (
                    <Text style={styles.encouragementText}>You're doing great — push a little further! 💪</Text>
                  )}
                </View>
              )}
            </Animated.ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: COLOR_PALETTE.backgroundLight,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
    opacity: 0.12,
    zIndex: -2,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  customHeader: {
    position: "absolute",
    top: Platform.OS === "android" ? 36 : 48,
    left: 14,
    right: 14,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 10,
    backgroundColor: "transparent",
  },
  backArrow: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLOR_PALETTE.primaryDark,
    textAlign: "left",
    marginLeft: 6,
  },
  refreshWrapper: {
    marginLeft: "auto",
  },
  refreshIconContainer: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLOR_PALETTE.lightText,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 22,
    marginTop: Platform.OS === "android" ? 120 : 116,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  title: {
    fontWeight: "800",
    fontSize: 28,
    color: COLOR_PALETTE.primary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: COLOR_PALETTE.primaryDark,
    fontWeight: "600",
    opacity: 0.85,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.14,
  },
  errorCard: {
    backgroundColor: COLOR_PALETTE.cardBackground,
    borderRadius: 18,
    padding: 26,
    marginTop: height * 0.12,
    alignItems: "center",
    shadowColor: COLOR_PALETTE.errorRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: COLOR_PALETTE.errorRed,
  },
  errorText: {
    fontSize: 18,
    color: COLOR_PALETTE.errorRed,
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  errorRefreshButton: {
    marginTop: 20,
    backgroundColor: COLOR_PALETTE.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 4,
  },
  errorRefreshButtonText: {
    color: COLOR_PALETTE.lightText,
    fontSize: 15,
    fontWeight: "700",
  },
  noDataCard: {
    backgroundColor: COLOR_PALETTE.cardBackground,
    borderRadius: 18,
    padding: 28,
    marginTop: height * 0.12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 7,
    borderLeftWidth: 6,
    borderLeftColor: COLOR_PALETTE.softBorder,
  },
  noDataIcon: {
    marginBottom: 18,
  },
  noDataText: {
    fontSize: 17,
    color: COLOR_PALETTE.greyText,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 8,
  },
  noDataSubText: {
    fontSize: 14,
    color: COLOR_PALETTE.primaryDark,
    textAlign: "center",
    paddingHorizontal: 12,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLOR_PALETTE.cardBackground,
    borderRadius: 14,
    borderTopLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: 22,
    elevation: 8,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    borderLeftWidth: 6,
    borderColor: COLOR_PALETTE.softBorder,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: COLOR_PALETTE.primaryDark,
    marginLeft: 12,
  },
  value: {
    fontSize: 20,
    color: COLOR_PALETTE.primaryDark,
    fontWeight: "900",
    marginTop: 6,
  },
  cardAchieved: {
    borderLeftColor: COLOR_PALETTE.successGreen,
  },
  cardProgress: {
    borderLeftColor: COLOR_PALETTE.accent,
  },
  cardRemaining: {
    borderLeftColor: COLOR_PALETTE.primary,
  },
  achievementBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLOR_PALETTE.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: COLOR_PALETTE.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  achievementText: {
    color: COLOR_PALETTE.lightText,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 12,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#F0F0F3",
    borderRadius: 8,
    marginTop: 14,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 8,
    position: "absolute",
    left: 0,
  },
  progressText: {
    position: "absolute",
    right: 10,
    fontSize: 11,
    fontWeight: "800",
    color: COLOR_PALETTE.primaryDark,
  },
  encouragementText: {
    fontSize: 14,
    color: COLOR_PALETTE.primaryDark,
    textAlign: "center",
    marginTop: 14,
    fontStyle: "italic",
    fontWeight: "600",
  },
  motivationText: {
    fontSize: 15,
    color: COLOR_PALETTE.primary,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
});

export default Target;




