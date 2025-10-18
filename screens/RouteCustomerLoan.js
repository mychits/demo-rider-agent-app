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
import baseUrl from "../constants/baseUrl";

const CustomerCard = ({ name, phone, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <View style={styles.cardContent}>
      <Icon name="user-circle" style={styles.cardIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{name}</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.phoneLabel}>📞 </Text>
          <Text style={styles.phoneValue}>{phone}</Text>
        </View>
      </View>
    </View>
    <Icon name="angle-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const RouteCustomerLoan = ({ route, navigation }) => {
  const { user, areaId } = route.params;
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLoanCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/loans/get-all-borrowers`);
        if (response.data) {
          setCustomers(response.data);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanCustomers();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LinearGradient
        colors={["#6C2DC7", "#9D50BB"]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* CUSTOM HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color="#1d0158ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>LOAN CUSTOMERS LIST</Text>
          
          <View style={styles.profileCircle}>
            <Icon name="money" size={22} color="#3e09b1ff" />
          </View>
          
        </View>
        

        {/* MAIN CONTENT */}
        <View style={styles.container}>
          {/* <View style={styles.titleContainer}>
            <Text style={styles.title}>Loan Customer List</Text>
            <Text style={styles.subtitle}>
              View, verify, and manage all registered loan accounts.
            </Text>
          </View> */}

          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#0426ffff" style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={(text) => setSearch(text)}
              placeholder="Search customers..."
              placeholderTextColor="#555"
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C2DC7" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 90 }}
              showsVerticalScrollIndicator={false}
            >
              {Array.isArray(customers) &&
                customers
                  .filter((customer) =>
                    customer.borrower?.full_name
                      ?.toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((customer, index) => (
                    <CustomerCard
                      key={index}
                      name={customer.borrower.full_name}
                      phone={customer.borrower.phone_number}
                      onPress={() =>
                        navigation.navigate("LoanPayin", {
                          customer: customer?.borrower?._id,
                          loan_id: customer._id,
                          custom_loan_id: customer.loan_id,
                        })
                      }
                    />
                  ))}
            </ScrollView>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    flex: 1,
  },
  headerContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  headerTitle: {
    color: "#3e09b1ff ",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  profileCircle: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 30,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 15,
    color: "#f1f1f1",
    textAlign: "center",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  searchIcon: {
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: 18,
    borderLeftWidth: 5,
    borderColor: "#0426ffff",
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  phoneLabel: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  phoneValue: {
    fontSize: 14,
    color: "#3e09b1ff",
  },
  cardIcon: {
    fontSize: 36,
    color: "#0426ffff",
  },
  arrowIcon: {
    fontSize: 22,
    color: "#0426ffff",
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
});

export default RouteCustomerLoan;
