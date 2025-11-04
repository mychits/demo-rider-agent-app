import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Svg, { G, Circle, Defs, Stop, RadialGradient } from "react-native-svg";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";

const { width } = Dimensions.get("window");
const circumference = 2 * Math.PI * 65;
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const Dashboard = ({ route, navigation }) => {
  const { user = {} } = route.params || {};
  const [agent, setAgent] = useState({});
  const [targetData, setTargetData] = useState({
    total: 0,
    achieved: 0,
    remaining: 0,
  });
  const [totalCollection, setTotalCollection] = useState(0);
  const [todayPayments, setTodayPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    const fetchAgent = async () => {
      if (user && user.userId) {
        try {
          const response = await axios.get(
            `${baseUrl}/agent/get-agent-by-id/${user.userId}`
          );
          if (response.data) setAgent(response.data);
        } catch {
          setAgent({});
        }
      }
    };
    fetchAgent();
  }, [user.userId]);

  const fetchTargetDetails = async (agentId, designationId) => {
    try {
      const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
      const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

      const res = await axios.get(`${baseUrl}/target/get-targets`, {
        params: { fromDate: startOfMonth, toDate: endOfMonth },
      });

      const allTargets = res.data || [];
      const selectedTarget = allTargets.find(
        (t) =>
          (t.agentId && (t.agentId._id === agentId || t.agentId === agentId)) ||
          (!t.agentId && t.designationId === designationId)
      );

      if (!selectedTarget) {
        setTargetData({ total: 0, achieved: 0, remaining: 0 });
        setProgress(0);
        return;
      }

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
        commRes.data?.summary?.actual_business?.replace(/[^0-9.-]+/g, "") || 0;
      const totalTarget = selectedTarget.totalTarget || 0;
      const achievedAmount = Number(actualBusiness);
      const remainingAmount =
        totalTarget > achievedAmount ? totalTarget - achievedAmount : 0;

      setTargetData({
        total: totalTarget,
        achieved: achievedAmount,
        remaining: remainingAmount,
      });

      const newProgress =
        totalTarget > 0 ? (achievedAmount / totalTarget) * 100 : 0;
      setProgress(newProgress);
    } catch {
      setTargetData({ total: 0, achieved: 0, remaining: 0 });
      setProgress(0);
    }
  };

  const fetchCollectionDetails = async (agentId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/payment/get-payment-agent/${agentId}`
      );
      const payments = response.data || [];

      const today = moment().format("YYYY-MM-DD");
      const filtered = payments.filter(
        (p) => moment(p.pay_date).format("YYYY-MM-DD") === today
      );

      setTodayPayments(filtered);

      const totalAmount = filtered.reduce(
        (sum, p) => sum + (parseFloat(p.amount) || 0),
        0
      );
      setTotalCollection(totalAmount);
    } catch {
      setTotalCollection(0);
      setTodayPayments([]);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const agentInfoJson = await AsyncStorage.getItem("agentInfo");
        const agentInfo = agentInfoJson ? JSON.parse(agentInfoJson) : null;
        const agentId = agentInfo?._id;
        const designationId = agentInfo?.designation_id;

        if (agentId) {
          await Promise.all([
            fetchTargetDetails(agentId, designationId),
            fetchCollectionDetails(agentId),
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const getStrokeDashoffset = () =>
    progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
    });

  const getProgressColor = () => {
    if (progress < 50) return "#FF3B30";
    if (progress < 80) return "#FFD60A";
    return "#34C759";
  };

  const getMotivationalMessage = () => {
    const pct = ((targetData.achieved / targetData.total) * 100).toFixed(0);
    if (targetData.total === 0) return "No target set yet. Check back soon!";
    if (pct === "0") return "Start strong — your success starts today!";
    if (pct < 50) return "Good start! Keep the momentum going!";
    if (pct < 80) return "You're on the right track — almost there!";
    if (pct >= 100) return "Amazing! You’ve surpassed your goals!";
    return "Keep it up — excellence is within reach!";
  };

  return (
    <LinearGradient
      colors={["#E8D9FF", "#CBB2FE", "#A78BFA"]}
      style={styles.gradientOverlay}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7F5AF0" />
        </View>
      ) : (
        <View style={styles.mainContentArea}>
          {/* Gradient Header */}
          <LinearGradient
            colors={["#8E2DE2", "#4A00E0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerContainer}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <View style={{ width: 26 }} />
          </LinearGradient>

          {/* Greeting */}
          <View style={styles.introSection}>
            <Text style={styles.welcomeText}>Hi, {agent.name || "Agent"}</Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Target Section */}
            <View style={styles.targetSection}>
              <LinearGradient
                colors={["#BFA2FF", "#7F5AF0"]}
                style={styles.performanceCard}
              >
                <View style={styles.performanceContent}>
                  {/* Circular progress */}
                  <View style={styles.circularProgressContainer}>
                    <AnimatedSvg width="100%" height="100%" viewBox="0 0 150 150">
                      <Defs>
                        <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor="#BFA2FF" />
                          <Stop offset="50%" stopColor="#9A73F5" />
                          <Stop offset="100%" stopColor="#7F5AF0" />
                        </RadialGradient>
                      </Defs>
                      <G rotation="-90" origin="75,75">
                        <Circle
                          cx="75"
                          cy="75"
                          r="65"
                          stroke="#E6E0FF"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <Circle
                          cx="75"
                          cy="75"
                          r="65"
                          stroke="url(#grad)"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={getStrokeDashoffset()}
                          strokeLinecap="round"
                        />
                      </G>
                    </AnimatedSvg>
                    <Text
                      style={[styles.performanceValue, { color: getProgressColor() }]}
                    >
                      {targetData.total > 0
                        ? `${((targetData.achieved / targetData.total) * 100).toFixed(0)}%`
                        : "0%"}
                    </Text>
                  </View>

                  {/* Right side text */}
                  <View style={styles.textAndButtonContainer}>
                    <Text style={styles.performanceLabel}>Target Progress</Text>
                    <Text style={styles.motivationalText}>
                      {getMotivationalMessage()}
                    </Text>
                    <TouchableOpacity
                      style={styles.performanceButton}
                      onPress={() => navigation.navigate("Target")}
                    >
                      <Text style={styles.performanceButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Today's Collection Section */}
            <View style={styles.collectionSection}>
              <LinearGradient
                colors={["#D8B4FE", "#A78BFA"]}
                style={styles.collectionGradient}
              >
                <View style={styles.collectionContent}>
                  <Feather name="trending-up" size={40} color="#047a35ff" />
                  <View style={styles.collectionTextContainer}>
                    <Text style={styles.collectionLabel}>Today's Collection</Text>
                    <Text style={styles.collectionValue}>
                      ₹
                      {totalCollection.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Collection Details */}
            <View style={styles.detailListContainer}>
              <Text style={styles.detailListTitle}>Collection Details</Text>
              {todayPayments.length > 0 ? (
                todayPayments.map((payment, index) => (
                  <View key={index} style={styles.paymentItemCard}>
                    <Text style={styles.paymentItemText}>
                      <Text style={styles.paymentItemLabel}>Customer:</Text>{" "}
                      {payment?.user_id?.full_name || "N/A"}
                    </Text>
                    <Text style={styles.paymentItemText}>
                      <Text style={styles.paymentItemLabel}>Amount:</Text> ₹
                      {parseFloat(payment.amount || 0).toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.paymentItemText}>
                      <Text style={styles.paymentItemLabel}>Receipt No:</Text>{" "}
                      {payment.receipt_no || "N/A"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noPaymentsText}>
                  No payments collected today.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContentArea: { flex: 1, paddingHorizontal: 20 },
  headerContainer: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 29,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: "#4A00E0",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  introSection: { marginTop: 20, marginBottom: 15 },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#000" },
  targetSection: { width: "100%", marginBottom: 20 },
  performanceCard: {
    borderRadius: 20,
    height: 250,
    padding: 15,
    justifyContent: "center",
    shadowColor: "#7F5AF0",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  performanceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circularProgressContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  performanceValue: { position: "absolute", fontSize: 30, fontWeight: "bold" },
  textAndButtonContainer: { flex: 1, alignItems: "center" },
  performanceLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  motivationalText: {
    fontSize: 13,
    color: "#f0e9ff",
    textAlign: "center",
    marginVertical: 10,
  },
  performanceButton: {
    backgroundColor: "#6B21A8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  performanceButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  collectionSection: { width: "100%", marginBottom: 20 },
  collectionGradient: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collectionTextContainer: { alignItems: "flex-start" },
  collectionLabel: { color: "#000", fontSize: 16, fontWeight: "600" },
  collectionValue: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  detailListContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#A78BFA",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    marginBottom: 30,
  },
  detailListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B0082",
    marginBottom: 15,
  },
  paymentItemCard: {
    backgroundColor: "#F6F0FF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  paymentItemText: { fontSize: 14, color: "#4B0082", marginBottom: 5 },
  paymentItemLabel: { fontWeight: "bold", color: "#7F5AF0" },
  noPaymentsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B21A8",
    paddingVertical: 20,
  },
});

export default Dashboard;
