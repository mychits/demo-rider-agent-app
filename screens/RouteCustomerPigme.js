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
        <Text style={styles.cardSubText}>📞 {phone}</Text>
      </View>
    </View>
    <Icon name="arrow-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const RouteCustomerPigme = ({ route, navigation }) => {
  const { user, areaId } = route.params;

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPigmeCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/pigme/get-all-pigme-customers`);
        if (response.data) {
          setCustomers(response.data);
        } else {
          console.error("Unexpected API response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPigmeCustomers();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          style={{ flex: 1, marginHorizontal: 22, marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={22} color="#008000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PIGME CUSTOMERS</Text>
            <View style={styles.profileCircle}>
              <Icon name="credit-card" size={20} color="#008000" />
            </View>
          </View>

          

          {/* Search */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#008000" style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={(text) => setSearch(text)}
              placeholder="Search Pigme customers..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>

          {/* List */}
          {loading ? (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <>
              {Array.isArray(customers) &&
                customers
                  .filter(
                    (item) =>
                      item.customer?.full_name
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) || ""
                  )
                  .map((item, index) => (
                    <CustomerCard
                      key={index}
                      name={item.customer?.full_name || "Unknown Customer"}
                      phone={item.customer?.phone_number || "N/A"}
                      onPress={() => {
                        navigation.navigate("PigmePayin", {
                          user,
                          customer: item.customer?._id,
                          pigme_id: item._id,
                          custom_pigme_id: item?.pigme_id,
                        });
                      }}
                    />
                  ))}
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fffb02ff",
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
  titleContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 5,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: "#008000",
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
    fontWeight: "bold",
    color: "#333",
  },
  cardSubText: {
    fontSize: 14,
    color: "#008000",
    marginTop: 2,
  },
  cardIcon: {
    fontSize: 32,
    color: "#008000",
  },
  arrowIcon: {
    fontSize: 22,
    color: "#008000",
  },
});

export default RouteCustomerPigme;
