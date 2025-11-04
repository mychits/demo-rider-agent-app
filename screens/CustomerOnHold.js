import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import chitBaseUrl from "../constants/baseUrl";
import { useNavigation } from "@react-navigation/native";

const CustomerOnHold = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agent, setAgent] = useState(null);
  const navigation = useNavigation();

  // ✅ Fetch agent details
  useEffect(() => {
    const fetchAgentById = async () => {
      try {
        const storedAgentInfo = await AsyncStorage.getItem("agentInfo");
        if (!storedAgentInfo) {
          setError("No agent info found. Please login again.");
          setLoading(false);
          return;
        }
        const parsedAgent = JSON.parse(storedAgentInfo);
        const agentId = parsedAgent?._id;

        if (!agentId) {
          setError("Agent ID not found in stored info.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${chitBaseUrl}/agent/get-agent-by-id/${agentId}`);
        setAgent(response.data);
      } catch (error) {
        console.error("Error fetching agent data:", error);
        setError("Failed to load agent information.");
        setLoading(false);
      }
    };

    fetchAgentById();
  }, []);

  // ✅ Fetch customers on hold
  useEffect(() => {
    if (!agent || !agent._id) return;

    const fetchCustomersOnHold = async () => {
      try {
        const apiUrl = `${chitBaseUrl}/enroll/holded?agent=${agent._id}`;
        const response = await axios.get(apiUrl);

        const formattedCustomers = response.data.map((item) => ({
          id: item.user_id._id,
          name: item.user_id.full_name,
          groupName: item.group_id.group_name,
          phoneNumber: item.user_id.phone_number,
          email: item.user_id.email,
        }));

        setCustomers(formattedCustomers);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError("Failed to load customer information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersOnHold();
  }, [agent]);

  // ---------- Helper functions ----------
  const handleCall = async (phoneNumber) => {
    try {
      const url = `tel:${phoneNumber}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open phone dialer:", error);
      Alert.alert("Error", "Could not open phone dialer.");
    }
  };

  const handleEmail = async (email, customerName) => {
    try {
      const subject = "Regarding your pending Chit payment";
      const body = `Dear ${customerName},\n\nWe noticed that your recent chit payment is still pending.\nPlease complete the payment at your earliest convenience.\n\nThank you,\nMyChits Team`;

      const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open email client:", error);
      Alert.alert("Error", "Could not open email client.");
    }
  };

  const handleWhatsApp = async (phoneNumber) => {
    try {
      const url = `whatsapp://send?phone=${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed on this device.");
      }
    } catch (error) {
      console.error("Failed to open WhatsApp:", error);
      Alert.alert("Error", "Could not open WhatsApp.");
    }
  };

  const renderCustomerCard = (customer) => (
    <View key={customer.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.groupType}>Chit</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.groupName}>{customer.groupName}</Text>
        <Text style={styles.phoneNumber}>Phone: {customer.phoneNumber}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.contactButton, styles.callButton]}
          onPress={() => handleCall(customer.phoneNumber)}
        >
          <Ionicons name="call" size={15} color="blue" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactButton, styles.whatsappButton]}
          onPress={() => handleWhatsApp(customer.phoneNumber)}
        >
          <FontAwesome5 name="whatsapp" size={20} color="#25D366" />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactButton, styles.emailButton]}
          onPress={() => handleEmail(customer.email, customer.name)}
        >
          <MaterialCommunityIcons name="email" size={15} color="#d32626ff" />
          <Text style={styles.buttonText}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Violet Header */}
      <LinearGradient
        colors={["#7b2cbf", "#9d4edd"]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customers On Hold</Text>
          <View style={{ width: 24 }} /> 
        </View>
      </LinearGradient>

      {/* Body */}
      <LinearGradient
        colors={["#f9f7fc", "#e8e3f0"]}
        style={styles.gradientOverlay}
      >
        <View style={styles.mainContentArea}>
          <Text style={styles.instructionText}>
            Follow up with these customers to resolve their hold status.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#7b2cbf" style={styles.loader} />
          ) : error ? (
            <Text style={styles.statusText}>{error}</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.cardsScrollViewContent}>
              {customers.length > 0 ? (
                customers.map(renderCustomerCard)
              ) : (
                <Text style={styles.statusText}>
                  No customers currently on hold.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  headerContainer: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    backgroundColor: "#250347ff"
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    

  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  gradientOverlay: { flex: 1 },
  mainContentArea: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  instructionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  loader: { marginTop: 50 },
  statusText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  cardsScrollViewContent: { paddingBottom: 20 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderColor: "#7A28CB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  customerName: { fontSize: 20, fontWeight: "bold", color: "#000" },
  groupType: { fontSize: 16, fontWeight: "bold", color: "#7A28CB" },
  cardBody: { marginBottom: 15 },
  groupName: { fontSize: 16, color: "red", fontWeight: "400" },
  phoneNumber: { fontSize: 16, color: "green", fontWeight: "500", marginTop: 5 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 50,
    elevation: 3,
    gap: 6,
  },
  callButton: { backgroundColor: "#fff" },
  whatsappButton: { backgroundColor: "#fff" },
  emailButton: { backgroundColor: "#fff" },
  buttonText: { color: "#000", fontWeight: "italic", fontSize: 15 },
});

export default CustomerOnHold;
