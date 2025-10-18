import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";

import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";

const noImage = require("../assets/no.png");
import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";

const CustomCommissionCard = ({ title, icon, value, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <View style={styles.cardContent}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={24} style={styles.cardIcon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{title}</Text>
        <Text style={styles.cardSubText}>{value}</Text>
      </View>
    </View>
    <MaterialIcons name="keyboard-arrow-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const Commissions = ({ route, navigation }) => {
  const { user } = route.params || {};
  const currentUser = user || {};

  const [chitCommissionLength, setChitCommissionLength] = useState(0);
  const [goldCommissionLength, setGoldCommissionLength] = useState(0);
  const [isChitLoading, setIsChitLoading] = useState(false);
  const [isGoldLoading, setIsGoldLoading] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [activeTab, setActiveTab] = useState("CHIT");

  const handleEstimatedCommission = () => {
    navigation.navigate("ExpectedCommissions", { user: currentUser });
  };

  const handleMyCommission = () => {
    navigation.navigate("MyCommission", { commissions });
  };

  const handleMyCustomers = () => {
    navigation.navigate("ViewEnrollments", { user: currentUser });
  };

  const handleGroups = () => {
    navigation.navigate("EnrolledGroups", { user: currentUser });
  };

  const scrollData = [
    {
      title: "Customers",
      icon: "person",
      value: "total_customers",
      key: "#1",
      handlePress: handleMyCustomers,
    },
    {
      title: "Groups",
      icon: "group",
      value: "total_groups",
      key: "#2",
      handlePress: handleGroups,
    },
    {
      title: "My Business",
      icon: "query-stats",
      value: "actual_business",
      key: "#6",
      handlePress: handleMyCommission,
    },
    {
      title: "Estimated Business",
      icon: "trending-up",
      value: "expected_business",
      key: "#5",
      handlePress: handleEstimatedCommission,
    },
    {
      title: "My Commission",
      icon: "payments",
      value: "total_actual",
      key: "#4",
      handlePress: handleMyCommission,
    },
    {
      title: "Estimated Commission",
      icon: "currency-rupee",
      value: "total_estimated",
      key: "#3",
      handlePress: handleEstimatedCommission,
    },
  ];

  useEffect(() => {
    const fetchCommissions = async () => {
      if (!currentUser.userId) return;
      const currentUrl =
        activeTab === "CHIT"
          ? `${baseUrl}`
          : "http://13.60.68.201:3000/api";

      try {
        activeTab === "CHIT"
          ? setIsChitLoading(true)
          : setIsGoldLoading(true);

        const response = await axios.get(
          `${currentUrl}/enroll/get-detailed-commission/${currentUser.userId}`
        );

        setCommissions(response.data);
        activeTab === "CHIT"
          ? setChitCommissionLength(response?.data?.length)
          : setGoldCommissionLength(response?.data?.length);
      } catch (err) {
        console.log(err, "error");
        setCommissions([]);
      } finally {
        activeTab === "CHIT"
          ? setIsChitLoading(false)
          : setIsGoldLoading(false);
      }
    };

    fetchCommissions();
  }, [activeTab, currentUser]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Violet Header with Back Button */}
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Commissions</Text>
          <View style={{ width: 30 }} /> {/* spacer for balance */}
        </View>

        <Text style={styles.headerSubtitle}>
          Track your Chit & Gold Commissions
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "CHIT" && styles.activeTab]}
            onPress={() => setActiveTab("CHIT")}
          >
            <Icon
              name="users"
              size={18}
              color={activeTab === "CHIT" ? "#6C2DC7" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "CHIT" && styles.activeTabText,
              ]}
            >
              Chits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "GOLD" && styles.activeTab]}
            onPress={() => setActiveTab("GOLD")}
          >
            <Icon
              name="diamond"
              size={16}
              color={activeTab === "GOLD" ? "#6C2DC7" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "GOLD" && styles.activeTabText,
              ]}
            >
              Gold Chits
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* White background content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardListContainer}>
            {activeTab === "CHIT" ? (
              isChitLoading ? (
                <ActivityIndicator size="large" color="#6C2DC7" />
              ) : chitCommissionLength === 0 ? (
                <Text style={styles.noDataText}>
                  No Chit Commission Found
                </Text>
              ) : (
                scrollData.map(({ title, icon, value, key, handlePress }) => (
                  <CustomCommissionCard
                    key={key}
                    title={title}
                    icon={icon}
                    value={commissions?.summary?.[value]}
                    onPress={handlePress}
                  />
                ))
              )
            ) : isGoldLoading ? (
              <ActivityIndicator size="large" color="#6C2DC7" />
            ) : goldCommissionLength === 0 ? (
              <View style={styles.noDataContainer}>
                <Image source={noImage} style={styles.noImage} />
                <Text style={styles.noDataText}>
                  No Gold Commission Found
                </Text>
              </View>
            ) : (
              scrollData.map(({ title, icon, value, key, handlePress }) => (
                <CustomCommissionCard
                  key={key}
                  title={title}
                  icon={icon}
                  value={commissions?.summary?.[value]}
                  onPress={handlePress}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 10,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "#6C2DC740",
    padding: 6,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#EAEAEA",
    marginTop: 8,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 15,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#EDE5FF",
  },
  tabText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    marginLeft: 5,
  },
  activeTabText: {
    color: "#6C2DC7",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -10,
  },
  cardListContainer: {
    marginTop: 25,
    gap: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderColor: "#6C2DC7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#6C2DC720",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    color: "#6C2DC7",
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubText: {
    fontSize: 14,
    color: "#006400",
    marginTop: 5,
  },
  arrowIcon: {
    fontSize: 22,
    color: "#6C2DC7",
  },
  noDataContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  noDataText: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },
  noImage: {
    width: 250,
    height: 150,
    resizeMode: "contain",
  },
});

export default Commissions;
