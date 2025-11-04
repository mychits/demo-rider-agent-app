import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import COLORS from "../constants/color";
import Button from "../components/Button";
import chitBaseUrl from "../constants/baseUrl";
import goldBaseUrl from "../constants/goldBaseUrl";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

const EnrollCustomer = ({ route, navigation }) => {
  const { user } = route.params;
  const [receipt, setReceipt] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerType, setSelectedCustomerType] = useState("chits");
  const [agentCustomers, setAgentCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [focusedInput, setFocusedInput] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const baseUrl =
    selectedCustomerType === "chits" ? `${chitBaseUrl}` : `${goldBaseUrl}`;

  const [formFields, setFormFields] = useState({
    user_id: "",
    group_id: "",
    no_of_tickets: "",
    tickets: "",
  });

  // ✅ Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${baseUrl}/group/get-group`);
        setGroups(response.data || []);
      } catch (err) {
        console.error("Failed to load Group Data");
      }
    };
    fetchGroups();
  }, [selectedCustomerType]);

  // ✅ Fetch users
  useEffect(() => {
    const fetchAgentUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/user/get-user`);
        setAgentCustomers(response.data || []);
      } catch (err) {
        console.error("Failed to load Customers Data");
      }
    };
    fetchAgentUsers();
  }, [selectedCustomerType]);

  // ✅ Fetch agent receipt
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axios.get(
          `${chitBaseUrl}/agent/get-agent-by-id/${user.userId}`
        );
        setReceipt(response.data);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };
    fetchReceipt();
  }, []);

  const filteredCustomers = agentCustomers.filter((customer) =>
    customer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customer) => {
    setFormFields({ ...formFields, user_id: customer._id });
    setIsSearchModalVisible(false);
    setSearchQuery("");
  };

  const handleCancel = () => {
    Alert.alert("Confirmation", "Are you sure you want to close?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: () => navigation.navigate("Home", { user }),
      },
    ]);
  };

  const handleInputChange = async (field, value) => {
    setFormFields({ ...formFields, [field]: value });
    if (field === "group_id") {
      try {
        const response = await axios.post(
          `${baseUrl}/enroll/get-next-tickets/${value}`
        );
        setAvailableTickets(response.data.availableTickets || []);
      } catch (err) {
        console.error("Error fetching next tickets");
      }
    }
  };

  const handleEnrollCustomer = async () => {
    if (!formFields.no_of_tickets || isNaN(formFields.no_of_tickets)) {
      ToastAndroid.show("Enter valid number of tickets.", ToastAndroid.SHORT);
      return;
    }


    if (Number(formFields.no_of_tickets) > availableTickets.length) {
      ToastAndroid.show(
        "Number of tickets exceeds available count.",
        ToastAndroid.SHORT
      );
      return;
    }

    if (
      !formFields.user_id ||
      !formFields.group_id ||
      !formFields.no_of_tickets
    ) {
      Alert.alert("Required", "Please fill all fields!");
      return;
    }

    const { no_of_tickets, group_id, user_id } = formFields;
    const ticketsCount = parseInt(no_of_tickets, 10);
    setIsLoading(true);

    const ticketEntries = availableTickets.slice(0, ticketsCount).map((t) => ({
      user_id,
      group_id,
      no_of_tickets: "1",
      tickets: t.toString(),
      agent: user.userId,
      created_by: user.userId,
      payment_type: "cash",
      referred_type: "self",
      referred_customer: null,
      referred_lead: null,
      chit_asking_month: "0",
    }));

    try {
      for (const ticket of ticketEntries) {
        await axios.post(`${baseUrl}/enroll/add-enroll`, ticket);
      }
      ToastAndroid.show("Customer enrolled successfully!", ToastAndroid.SHORT);
      navigation.replace("BottomNavigation", { user });
    } catch (error) {
      console.error("Error:", error?.response?.data || error.message);
      Alert.alert("Error", "Enrollment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* ✅ Violet Gradient Header */}
      <LinearGradient
        colors={["#7b2ff7", "#9e5fff"]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Enrollment</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ✅ Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Customer Type</Text>
              <View style={styles.inputBox}>
                <Picker
                  selectedValue={selectedCustomerType}
                  onValueChange={(v) => setSelectedCustomerType(v)}
                >
                  <Picker.Item label="Chits" value="chits" />
                  <Picker.Item label="Gold Chits" value="goldChit" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Group</Text>
              <View style={styles.inputBox}>
                <Picker
                  selectedValue={formFields.group_id}
                  onValueChange={(v) => handleInputChange("group_id", v)}
                >
                  <Picker.Item label="Select Group" value="" />
                  {groups.map((g) => (
                    <Picker.Item key={g._id} label={g.group_name} value={g._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Customer</Text>
              <TouchableOpacity
                style={styles.inputBox}
                onPress={() => setIsSearchModalVisible(true)}
              >
                <Text style={{ color: COLORS.black }}>
                  {formFields.user_id
                    ? agentCustomers.find((c) => c._id === formFields.user_id)
                        ?.full_name || "Select Customer"
                    : "Select Customer"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Number of Tickets</Text>
              <TextInput
                placeholder="Enter number of tickets"
                style={styles.textInput}
                keyboardType="numeric"
                value={formFields.no_of_tickets}
                onChangeText={(v) => handleInputChange("no_of_tickets", v)}
              />
              {formFields.group_id && (
                <Text style={styles.ticketInfo}>
                  {availableTickets.length > 0
                    ? `${availableTickets.length} tickets left`
                    : "Group is full"}
                </Text>
              )}
            </View>

            <Button
              title={isLoading ? "Please wait..." : "Enroll Customer"}
              filled
              disabled={isLoading}
              style={styles.submitButton}
              onPress={handleEnrollCustomer}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        animationType="slide"
        onRequestClose={() => setIsSearchModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsSearchModalVisible(false)}>
              <Feather name="arrow-left" size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Customer</Text>
          </View>

          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#777" />
            <TextInput
              placeholder="Search by name"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.customerItem}
                onPress={() => handleSelectCustomer(item)}
              >
                <Text style={styles.customerText}>{item.full_name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.noCustomer}>No customers found.</Text>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default EnrollCustomer;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  skipButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  skipButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    justifyContent: "center",
    elevation: 2,
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    elevation: 2,
  },
  ticketInfo: {
    textAlign: "center",
    marginTop: 5,
    fontWeight: "bold",
    color: "#7b2ff7",
  },
  submitButton: {
    marginTop: 25,
    borderRadius: 25,
    backgroundColor:"#7b2ff7",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#000",
  },
  customerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  customerText: {
    fontSize: 16,
    color: "#333",
  },
  noCustomer: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
  },
});
