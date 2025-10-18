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
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import baseUrl from "../constants/baseUrl";

const EnrolledGroups = ({ route, navigation }) => {
  const { user } = route.params;
  const [chitCustomerLength, setChitCustomerLength] = useState(0);
  const [goldCustomerLength, setGoldCustomerLength] = useState(0);
  const [isChitLoading, setIsChitLoading] = useState(false);
  const [isGoldLoading, setIsGoldLoading] = useState(false);
  const [customers, setCustomer] = useState([]);
  const [activeTab, setActiveTab] = useState("CHIT");
  const [searchQuery, setSearchQuery] = useState("");

  const sendWhatsappMessage = async (item) => {
    if (item.user_id?.phone_number) {
      let url = `whatsapp://send?phone=${
        item.user_id?.phone_number
      }&text=${encodeURIComponent("Hello there!")}`;

      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert("WhatsApp is not installed");
          }
        })
        .catch(() => Alert.alert("Something went wrong!"));
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
        .catch(() => Alert.alert("Something went wrong!"));
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
        if (response.status >= 400)
          throw new Error("Failed to fetch Enrolled customer Data");
        setCustomer(response.data);
        activeTab === "CHIT"
          ? setChitCustomerLength(response?.data?.length)
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
    fetchEnrolledCustomers();
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
    <Pressable
      onPress={() => openDialer(item)}
      onLongPress={() => sendWhatsappMessage(item)}
      style={styles.card}
    >
      <View style={styles.leftSection}>
        <Text style={styles.name}>
          {item?.group_id?.group_name || "No Group Name"}
        </Text>
        <Text style={styles.groupName}>
          {item?.user_id?.full_name || "No User Name"}
        </Text>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.ticketContainer}>
          <Text style={styles.ticketsText}>TNo:</Text>
          <Text style={styles.ticketsNumber}>{item?.tickets}</Text>
        </View>
        {/* <MaterialIcons name="keyboard-arrow-right" style={styles.arrowIcon} /> */}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Violet Header */}
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Enrolled Groups</Text>
          <Text style={styles.headerSubtitle}>View all groups enrolled by you</Text>
        </View>
      </LinearGradient>

      {/* White Content Area */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
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
                color={activeTab === "CHIT" ? "#fff" : "#666"}
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
                color={activeTab === "GOLD" ? "#fff" : "#666"}
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

          {/* List */}
          {activeTab === "CHIT" ? (
            isChitLoading ? (
              <ActivityIndicator size="large" color="#6C2DC7" style={{ marginTop: 20 }} />
            ) : chitCustomerLength === 0 ? (
              <Text style={styles.noLeadsText}>No CHIT enrolled customers found.</Text>
            ) : (
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderEnrolledCustomerCard}
                ListEmptyComponent={() => (
                  <Text style={styles.noLeadsText}>No matching groups found.</Text>
                )}
              />
            )
          ) : isGoldLoading ? (
            <ActivityIndicator size="large" color="#6C2DC7" style={{ marginTop: 20 }} />
          ) : goldCustomerLength === 0 ? (
            <Text style={styles.noLeadsText}>No GOLD CHIT enrolled customers found.</Text>
          ) : (
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderEnrolledCustomerCard}
              ListEmptyComponent={() => (
                <Text style={styles.noLeadsText}>No matching groups found.</Text>
              )}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 6,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#eaeaea",
    fontSize: 13,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f3e8ff",
    borderRadius: 15,
    marginBottom: 10,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 15,
  },
  activeTab: { backgroundColor: "#6C2DC7" },
  tabText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
    marginLeft: 5,
  },
  activeTabText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 6,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderColor: "#6C2DC7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leftSection: { flex: 1 },
  rightSection: { alignItems: "flex-end", flexDirection: "row", gap: 5 },

  name: {
    fontSize: 15,
    fontWeight: "900",
    color: "green",
    marginBottom: 5,
  },
  groupName: {
    fontSize: 16,
    color: "#000",
  },
  ticketContainer: {
    backgroundColor: "#EEE6FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",

  },
  ticketsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6C2DC7",
  },
  ticketsNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "red",
  },
//   arrowIcon: {
//     fontSize: 22,
//     color: "#6C2DC7",
//   },
  noLeadsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default EnrolledGroups;
