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
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { whatsappMessage } from "../components/data/messages";
import { LinearGradient } from "expo-linear-gradient";

const ExpectedCommissions = ({ route, navigation }) => {
  const { user } = route.params;
  const [chitCustomerLength, setChitCustomerLength] = useState(0);
  const [goldCustomerLength, setGoldCustomerLength] = useState(0);
  const [isChitLoading, setIsChitLoading] = useState(false);
  const [isGoldLoading, setIsGoldLoading] = useState(false);
  const [customers, setCustomer] = useState([]);
  const [activeTab, setActiveTab] = useState("CHIT");
  const [totalChitCommmissions, setTotalChitCommissions] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const sendWhatsappMessage = async (item) => {
    if (item.user_id?.phone_number) {
      let url = `whatsapp://send?phone=${item.user_id?.phone_number
        }&text=${encodeURIComponent(whatsappMessage)}`;

      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert("WhatsApp is not installed");
          }
        })
        .catch((err) => console.error("An error occurred", err));
    }
  };

  const openDialer = (item) => {
    if (item?.user_id?.phone_number) {
      Linking.canOpenURL(`tel:${item.user_id.phone_number}`)
        .then((supported) => {
          if (supported) {
            Linking.openURL(`tel:${item.user_id.phone_number}`);
          }
        })
        .catch(() => {
          Alert.alert("Something went wrong!");
        });
    }
  };

  useEffect(() => {
    const fetchExpectedCommissions = async () => {
      const currentUrl =
        activeTab === "CHIT" ? `${baseUrl}` : "http://13.60.68.201:3000/api";
      try {
        activeTab === "CHIT" ? setIsChitLoading(true) : setIsGoldLoading(true);
        const response = await axios.get(
          `${currentUrl}/enroll/get-commission-info/${user.userId}`
        );

        if (response.status >= 400)
          throw new Error("Failed to fetch Enrolled customer Data");

        setCustomer(response.data.dataWithCommission);
        setTotalChitCommissions(response?.data?.total_commission);

        activeTab === "CHIT"
          ? setChitCustomerLength(response?.data?.dataWithCommission.length)
          : setGoldCustomerLength(response?.data?.length);
      } catch (err) {
        console.log(err, "error");
        setCustomer([]);
      } finally {
        activeTab === "CHIT"
          ? setIsChitLoading(false)
          : setIsGoldLoading(false);
      }
    };
    fetchExpectedCommissions();
  }, [activeTab, user]);

  const filteredCustomers = customers.filter((customer) => {
    const groupName = customer?.group_id?.group_name || "";
    const userName = customer?.user_id?.full_name || "";
    const query = searchQuery.toLowerCase();
    return (
      groupName.toLowerCase().includes(query) ||
      userName.toLowerCase().includes(query)
    );
  });

  const renderEnrolledCustomerCard = ({ item }) => (
    <TapGestureHandler
      numberOfTaps={2}
      onActivated={() => sendWhatsappMessage(item)}
    >
      <Pressable onPress={() => openDialer(item)} style={styles.card}>
        <View style={styles.leftSection}>
          <Text style={styles.groupName}>
            {item?.group_id?.group_name || "No Group Name"}
          </Text>
          <Text style={styles.name}>
            {item?.user_id?.full_name || "No User Name"}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionText}>
              {`${item?.calculated_commission || "0"}`}
            </Text>
          </View>
        </View>
      </Pressable>
    </TapGestureHandler>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f4fb" }}>
      {/* Violet Header */}
      <LinearGradient
        colors={["#5A00E0", "#540594ff", "#38027aff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expected Commissions</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1, marginHorizontal: 20, marginTop: 20 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or group"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "CHIT" && styles.activeTab]}
              onPress={() => setActiveTab("CHIT")}
            >
              <MaterialIcons
                name="groups"
                size={20}
                color={activeTab === "CHIT" ? "#fff" : "#6A1B9A"}
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
              <MaterialIcons
                name="diamond"
                size={20}
                color={activeTab === "GOLD" ? "#fff" : "#6A1B9A"}
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

          {/* Total Commission */}
          <View style={styles.totalCard}>
            <View style={styles.totalCardContent}>
              <View>
                <Text style={styles.totalCardText}>
                  Total Expected Commission
                </Text>
                <Text style={styles.totalCardValue}>
                  {totalChitCommmissions || 0}
                </Text>
              </View>
              <MaterialIcons
                name="trending-up"
                size={28}
                style={styles.cardIcon}
              />
            </View>
          </View>

          {/* Customer List */}
          {activeTab === "CHIT" ? (
            isChitLoading ? (
              <ActivityIndicator
                size="large"
                color="#7B1FA2"
                style={{ marginTop: 20 }}
              />
            ) : chitCustomerLength === 0 ? (
              <Text style={styles.noLeadsText}>
                No CHIT expected commissions found.
              </Text>
            ) : (
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderEnrolledCustomerCard}
              />
            )
          ) : isGoldLoading ? (
            <ActivityIndicator
              size="large"
              color="#7B1FA2"
              style={{ marginTop: 20 }}
            />
          ) : goldCustomerLength === 0 ? (
            <Text style={styles.noLeadsText}>
              No GOLD CHIT expected commissions found.
            </Text>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderEnrolledCustomerCard}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 110,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: "flex-end",
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 8,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E1BEE7",
    borderRadius: 12,
    marginVertical: 15,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#38027aff",
  },
  tabText: {
    fontSize: 15,
    color: "#38027aff",
    marginLeft: 5,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  totalCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    borderLeftWidth: 6,
    borderColor: "#38027aff",
    marginBottom: 10,
    elevation: 4,
  },
  totalCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalCardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  totalCardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
  },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderColor: "#38027aff",
    elevation: 2,
  },
  leftSection: {},
  rightSection: {},
  groupName: {
    fontSize: 15,
    color: "#6A1B9A",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  commissionContainer: {
    backgroundColor: "#EDE7F6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  commissionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#38027aff",
  },
  cardIcon: {
    color: "#38027aff",
  },
  noLeadsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
});

export default ExpectedCommissions;
