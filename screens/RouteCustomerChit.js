import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";

const COLOR_PALETTE = {
  primary: "#6C2DC7", // Deep violet
  secondary: "#3B1E7A", // Dark violet tone
  white: "#FFFFFF",
  textDark: "#2C2C2C",
  textLight: "#777777",
  accent: "#8B5CF6", // Soft purple accent
};

const CustomerCard = ({ name, phone, customerId, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <View style={styles.cardContent}>
      <Icon name="user-circle" style={styles.cardIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{name}</Text>
        <Text style={styles.cardSubText}>📞 {phone}</Text>
        <Text style={styles.cardSubTextCus}>🆔 {customerId}</Text>
      </View>
    </View>
    <Icon name="arrow-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const RouteCustomer = ({ route, navigation }) => {
  const { user } = route.params;
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch agent info
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${baseUrl}/agent/get-employee`);
        setAgent(response?.data?.employee || []);
      } catch (error) {
        console.error("Unable to get agent id");
      }
    };
    fetchEmployee();
  }, []);

  // Fetch customers
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PALETTE.white }}>
      <LinearGradient
        colors={[COLOR_PALETTE.primary, COLOR_PALETTE.secondary]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* ===== Header ===== */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={COLOR_PALETTE.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>CHITS COLLECTION SHEET</Text>

          <View style={styles.profileCircle}>
            <Icon name="money" size={20} color={COLOR_PALETTE.primary} />
          </View>
        </View>

        {/* ===== Search Bar ===== */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Search customers..."
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
        </View>

        {/* ===== Scroll Area ===== */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <ActivityIndicator size="large" color={COLOR_PALETTE.white} />
              <Text style={{ color: COLOR_PALETTE.white, marginTop: 10 }}>
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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    marginHorizontal: 22,
    marginTop: 12,
  },

  // ===== Header =====
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginHorizontal: 22,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLOR_PALETTE.white,
    letterSpacing: 1,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  // ===== Search Box =====
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 40,
    padding: 8,
    width: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  searchIcon: {
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    color: COLOR_PALETTE.textDark,
  },

  // ===== Customer Card =====
  card: {
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 15,
    padding: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: COLOR_PALETTE.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 15,
  },
  cardText: {
    fontSize: 18,
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
  cardIcon: {
    fontSize: 32,
    color: COLOR_PALETTE.accent,
  },
  arrowIcon: {
    fontSize: 22,
    color: COLOR_PALETTE.accent,
  },

  // ===== No Customers =====
  noCustomersText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#EEE",
  },
});

export default RouteCustomer;
