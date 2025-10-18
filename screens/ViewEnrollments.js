import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { Feather } from "@expo/vector-icons";
import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";
import { TapGestureHandler } from "react-native-gesture-handler";
import { whatsappMessage } from "../components/data/messages";

const noImage = require("../assets/no.png");

const ViewEnrollments = ({ route, navigation }) => {
  const { user } = route.params;
  const [chitCustomerLength, setChitCustomerLength] = useState(0);
  const [goldCustomerLength, setGoldCustomerLength] = useState(0);
  const [isChitLoading, setIsChitLoading] = useState(false);
  const [isGoldLoading, setIsGoldLoading] = useState(false);
  const [customers, setCustomer] = useState([]);
  const [activeTab, setActiveTab] = useState("CHIT");
  const [search, setSearch] = useState("");

  const sendWhatsappMessage = async (item) => {
    if (item.user_id?.phone_number) {
      const url = `whatsapp://send?phone=${item.user_id.phone_number}&text=${encodeURIComponent(
        whatsappMessage
      )}`;
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert("WhatsApp is not installed");
      } catch (err) {
        console.error(err);
      }
    } else {
      Alert.alert("No phone number found!");
    }
  };

  const openDialer = (item) => {
    if (item?.user_id?.phone_number) {
      Linking.openURL(`tel:${item.user_id.phone_number}`).catch(() =>
        Alert.alert("Something went wrong!")
      );
    } else {
      Alert.alert("No phone number found!");
    }
  };

  useEffect(() => {
    const fetchEnrolledCustomers = async () => {
      const currentUrl =
        activeTab === "CHIT" ? `${baseUrl}` : "http://13.60.68.201:3000/api";
      try {
        activeTab === "CHIT" ? setIsChitLoading(true) : setIsGoldLoading(true);
        const response = await axios.get(
          `${currentUrl}/enroll/get-enroll-by-agent-id/${user.userId}`
        );
        setCustomer(response.data);
        activeTab === "CHIT"
          ? setChitCustomerLength(response?.data?.length)
          : setGoldCustomerLength(response?.data?.length);
      } catch (err) {
        console.log(err);
        setCustomer([]);
      } finally {
        activeTab === "CHIT"
          ? setIsChitLoading(false)
          : setIsGoldLoading(false);
      }
    };
    fetchEnrolledCustomers();
  }, [activeTab, user]);

  const filteredCustomers = customers.filter((customer) =>
    customer?.user_id?.full_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderEnrolledCustomerCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.name}>{item?.user_id?.full_name || "No Name"}</Text>
        <Text style={styles.groupName}>
          {item?.group_id?.group_name || "No Group Name"}
        </Text>
        <View style={styles.ticketRow}>
          <Text style={styles.phoneNumber}>TNo :</Text>
          <Text style={styles.tno}>{item?.tickets}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.schemeType}>
          {activeTab[0] + activeTab?.slice(1).toLowerCase()}
        </Text>

        {/* Action Buttons */}
        <View style={styles.iconRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openDialer(item)}
          >
            <Icon name="phone" size={18} color="#4CAF50" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { marginLeft: 12 }]}
            onPress={() => sendWhatsappMessage(item)}
          >
            <Icon name="whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Violet Gradient Header */}
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Customers</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.headerSubtitle}>
          Manage your Chit & Gold Enrollments
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "CHIT" && styles.activeTab]}
            onPress={() => setActiveTab("CHIT")}
          >
            <Icon
              name="users"
              size={16}
              color={activeTab === "CHIT" ? "#6C2DC7" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "CHIT" && styles.activeTabText,
              ]}
            >
              Chits {chitCustomerLength || 0}
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
              Gold Chits {goldCustomerLength || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.contentContainer}>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={18}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customers..."
              placeholderTextColor="#888"
              style={styles.searchInput}
            />
          </View>

          {/* List or empty state */}
          {activeTab === "CHIT" ? (
            isChitLoading ? (
              <ActivityIndicator size="large" color="#6C2DC7" />
            ) : filteredCustomers.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Image source={noImage} style={styles.noImage} />
                <Text style={styles.noDataText}>
                  No CHIT enrolled customers found.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item, index) => item?._id || index.toString()}
                renderItem={renderEnrolledCustomerCard}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : isGoldLoading ? (
            <ActivityIndicator size="large" color="#6C2DC7" />
          ) : filteredCustomers.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Image source={noImage} style={styles.noImage} />
              <Text style={styles.noDataText}>
                No GOLD CHIT enrolled customers found.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item, index) => item?._id || index.toString()}
              renderItem={renderEnrolledCustomerCard}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EnrollCustomer", { user: user })
          }
          style={styles.addButton}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#EAEAEA",
    textAlign: "center",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 25,
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
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#6C2DC7",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderColor: "#6C2DC7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  leftSection: { flex: 1 },
  rightSection: { alignItems: "flex-end", justifyContent: "space-between" },
  name: { fontSize: 17, fontWeight: "600", color: "#222" },
  groupName: { fontSize: 14, color: "#ff0000ff", marginTop: 4 },
  schemeType: { fontSize: 14, color: "#6C2DC7", fontWeight: "600" },
  phoneNumber: { fontSize: 13, color: "#222", marginTop: 3 },
  tno: { fontSize: 15, color: "green", marginTop: 3, marginLeft: 5 },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconButton: {
    backgroundColor: "#F8F8F8",
    padding: 8,
    borderRadius: 10,
    elevation: 3,
  },
  noDataContainer: { alignItems: "center", marginTop: 40 },
  noDataText: { color: "#777", fontSize: 14, marginTop: 10 },
  noImage: { width: 220, height: 140, resizeMode: "contain" },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#6C2DC7",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
});

export default ViewEnrollments;
