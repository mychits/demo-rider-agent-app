import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";

const COLOR_PALETTE = {
  primary: "#7C3AED",
  secondary: "#9B5DE5",
  accent: "#A78BFA",
  white: "#FFFFFF",
  textDark: "#1F1F1F",
  textLight: "#6B6B6B",
};

const CustomerCard = ({ name, phone, customerId, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
    <View style={styles.cardContent}>
      <Icon name="user-circle" style={styles.cardIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{name}</Text>
        <Text style={styles.cardSubText}>📞 {phone}</Text>
        <Text style={styles.cardSubTextCus}>🆔 {customerId}</Text>
      </View>
    </View>
    <Icon name="angle-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const RouteCustomer = ({ route, navigation }) => {
  const { user } = route.params;
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${baseUrl}/agent/get-employee`);
        setAgent(response?.data?.employee || []);
      } catch (error) {
        console.error("Unable to get agent id", error);
      }
    };
    fetchEmployee();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!agent || agent.length === 0) return;
      try {
        setLoading(true);
        const agentId = user.userId;
        if (!agentId) return;

        const response = await axios.get(
          `${baseUrl}/user/collection-area/agent/${agentId}`
        );

        if (Array.isArray(response.data)) {
          setCustomers(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [agent]);

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((customer) =>
        customer.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // header height constant (you can tweak)
  const HEADER_HEIGHT = 120;
  // top offset to include status bar
 const TOP_HEIGHT =
   Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 10 : 44;

  return (
    <View style={styles.container}>
      {/* Put StatusBar translucent so system icons draw over our gradient */}
    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Absolute gradient that covers status bar + header area */}
      <LinearGradient
        colors={[COLOR_PALETTE.primary, COLOR_PALETTE.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.topGradient,
          { height: TOP_HEIGHT + HEADER_HEIGHT }, // cover status bar + header area
        ]}
      />

      {/* Main content - SafeAreaView placed after the absolute gradient */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header content placed with paddingTop so it appears below the gradient visually */}
        <View style={[styles.headerContainer, { paddingTop: TOP_HEIGHT }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={20} color={COLOR_PALETTE.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>CHITS COLLECTION SHEET</Text>

            <View style={styles.profileCircle}>
              <Icon name="money" size={18} color={COLOR_PALETTE.primary} />
            </View>
          </View>

          <Text style={styles.headerSubtitle}>Manage and collect payments easily 💸</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#777" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Search customers..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>

        {/* List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={{ marginTop: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={COLOR_PALETTE.primary} />
              <Text style={{ color: COLOR_PALETTE.textLight, marginTop: 10 }}>
                Loading customers...
              </Text>
            </View>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={index}
                name={customer.full_name}
                phone={customer.phone_number}
                customerId={customer.customer_id}
                onPress={() =>
                  navigation.navigate("Payin", { customer: customer._id })
                }
              />
            ))
          ) : (
            <Text style={styles.noCustomersText}>No customers found.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default RouteCustomer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_PALETTE.white, // page background
  },
  // absolute gradient at very top (behind statusbar + header)
  topGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    elevation: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },

  // header container (actual header content)
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // note: background is transparent — gradient behind provides color
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: COLOR_PALETTE.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  headerSubtitle: {
    color: "#EDE9FE",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLOR_PALETTE.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLOR_PALETTE.textDark,
  },

  scroll: {
    flex: 1,
    marginHorizontal: 20,
  },

  card: {
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: COLOR_PALETTE.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 32,
    color: COLOR_PALETTE.accent,
  },
  textContainer: {
    marginLeft: 15,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLOR_PALETTE.textDark,
  },
  cardSubText: {
    fontSize: 14,
    color: "green",
    marginTop: 2,
  },
  cardSubTextCus: {
    fontSize: 14,
    color: "red",
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 22,
    color: COLOR_PALETTE.accent,
  },

  noCustomersText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: COLOR_PALETTE.textLight,
  },
});
