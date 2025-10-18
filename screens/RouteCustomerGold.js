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
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

import COLORS from "../constants/color";
// import baseUrl from "../constants/baseUrl";
import goldUrl from "../constants/goldBaseUrl";

const CustomerCard = ({ name, phone, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <View style={styles.cardContent}>
      <Icon name="user-circle" style={styles.cardIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{name}</Text>
        <Text style={styles.phoneNumber}>📞 {phone}</Text>
      </View>
    </View>
    <Icon name="angle-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const RouteCustomerGold = ({ route, navigation }) => {
  const { user, areaId } = route.params;

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${goldUrl}/user/get-user`);
        if (response.data) {
          setCustomers(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((c) =>
        c.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8FF" }}>
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* ===== Header ===== */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color="#EFBF04" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>GOLD CUSTOMERS LIST</Text>

          <View style={styles.profileCircle}>
            <Icon name="diamond" size={20} color="#EFBF04" />
          </View>
        </View>

        {/* ===== Search Bar ===== */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#EFBF04" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Search gold customers..."
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
        </View>

        {/* ===== Customer List ===== */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#EFBF04" />
            </View>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={index}
                name={customer.full_name}
                phone={customer.phone_number}
                onPress={() =>
                  navigation.navigate("GoldPayin", { customer: customer._id })
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
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // ===== Header =====
  headerContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  headerTitle: {
    color: "#EFBF04",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  profileCircle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // ===== Scroll Area =====
  scrollArea: {
    flex: 1,
    marginTop: 10,
  },

  // ===== Search Box =====
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },

  // ===== Customer Card =====
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 18,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: "#EFBF04",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 18,
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
    fontWeight: "bold",
    color: "#000",
  },
  phoneNumber: {
    fontSize: 14,
    color: "#8a6e00ff",
    marginTop: 2,
  },
  cardIcon: {
    fontSize: 34,
    color: "#EFBF04",
  },
  arrowIcon: {
    fontSize: 22,
    color: "#EFBF04",
  },

  // ===== Empty State =====
  noCustomersText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#EEE",
  },
});

export default RouteCustomerGold;
