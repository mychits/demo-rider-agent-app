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
  LayoutAnimation,
  UIManager,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import COLORS from "../constants/color";
import chitBaseUrl from "../constants/baseUrl";
import goldBaseUrl from "../constants/goldBaseUrl";
import { Picker } from "@react-native-picker/picker";
import Feather from "react-native-vector-icons/Feather";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AddCustomer = ({ route, navigation }) => {
  const { user } = route.params;
  const [receipt, setReceipt] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomerType, setSelectedCustomerType] = useState("chit");
  const [focusedInput, setFocusedInput] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    address: false,
    ids: false,
  });

  const [customerInfo, setCustomerInfo] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    address: "",
    pincode: "",
    adhaar_no: "",
    pan_no: "",
  });

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

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo({ ...customerInfo, [field]: value });
  };

  const handleAddCustomer = async () => {
    setIsLoading(true);
    const baseUrl =
      selectedCustomerType === "chit" ? `${chitBaseUrl}` : `${goldBaseUrl}`;

    // Validation
    if (
      !customerInfo.full_name ||
      !customerInfo.phone_number ||
      !customerInfo.email ||
      !customerInfo.password ||
      !customerInfo.address ||
      !customerInfo.pincode ||
      !customerInfo.adhaar_no
    ) {
      Alert.alert("Required", "All fields must be filled.");
      setIsLoading(false);
      return;
    }

    if (customerInfo.phone_number.length !== 10) {
      ToastAndroid.show("Invalid Phone Number", ToastAndroid.SHORT);
      setIsLoading(false);
      return;
    }

    try {
      const data = { ...customerInfo, agent: user.userId };
      const response = await axios.post(`${baseUrl}/user/add-user`, data);

      if (response.status === 201) {
        ToastAndroid.show(
          "Customer Added Successfully!",
          ToastAndroid.SHORT
        );
        setCustomerInfo({
          full_name: "",
          phone_number: "",
          email: "",
          password: "",
          address: "",
          pincode: "",
          adhaar_no: "",
          pan_no: "",
        });
        setSelectedCustomerType("chit");
        navigation.replace("EnrollCustomer", { user });
      }
    } catch (error) {
      console.error("Error adding customer:", error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Customer</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Customer", { user })}
          style={styles.myCustomersButton}
        >
          <Text style={styles.myCustomersButtonText}>My Customers</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.formCard}>

            {/* Personal Info Section */}
            <AccordionSection
              title="Personal Info"
              expanded={expandedSections.personal}
              onToggle={() => toggleSection("personal")}
            >
              <InputField
                label="Full Name"
                icon="user"
                required
                value={customerInfo.full_name}
                onChangeText={(v) => handleInputChange("full_name", v)}
                focused={focusedInput === "full_name"}
                onFocus={() => setFocusedInput("full_name")}
                onBlur={() => setFocusedInput(null)}
              />
              <InputField
                label="Email"
                icon="mail"
                required
                value={customerInfo.email}
                keyboardType="email-address"
                onChangeText={(v) => handleInputChange("email", v)}
                focused={focusedInput === "email"}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
              <View style={styles.row}>
                <View style={styles.column}>
                  <InputField
                    label="Phone"
                    icon="phone"
                    required
                    value={customerInfo.phone_number}
                    keyboardType="number-pad"
                    onChangeText={(v) => handleInputChange("phone_number", v)}
                    focused={focusedInput === "phone_number"}
                    onFocus={() => setFocusedInput("phone_number")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.column}>
                  <InputField
                    label="Password"
                    icon="lock"
                    required
                    value={customerInfo.password}
                    secureTextEntry
                    onChangeText={(v) => handleInputChange("password", v)}
                    focused={focusedInput === "password"}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </AccordionSection>

            {/* Address Section */}
            <AccordionSection
              title="Address Info"
              expanded={expandedSections.address}
              onToggle={() => toggleSection("address")}
            >
              <InputField
                label="Address"
                icon="home"
                required
                value={customerInfo.address}
                onChangeText={(v) => handleInputChange("address", v)}
                focused={focusedInput === "address"}
                onFocus={() => setFocusedInput("address")}
                onBlur={() => setFocusedInput(null)}
              />
              <InputField
                label="Pincode"
                icon="map-pin"
                required
                value={customerInfo.pincode}
                keyboardType="number-pad"
                onChangeText={(v) => handleInputChange("pincode", v)}
                focused={focusedInput === "pincode"}
                onFocus={() => setFocusedInput("pincode")}
                onBlur={() => setFocusedInput(null)}
              />
            </AccordionSection>

            {/* IDs Section */}
            <AccordionSection
              title="ID Details"
              expanded={expandedSections.ids}
              onToggle={() => toggleSection("ids")}
            >
              <InputField
                label="Aadhaar Number"
                icon="credit-card"
                required
                value={customerInfo.adhaar_no}
                keyboardType="number-pad"
                onChangeText={(v) => handleInputChange("adhaar_no", v)}
                focused={focusedInput === "adhaar_no"}
                onFocus={() => setFocusedInput("adhaar_no")}
                onBlur={() => setFocusedInput(null)}
              />
              <InputField
                label="PAN Number"
                icon="file-text"
                value={customerInfo.pan_no}
                onChangeText={(v) => handleInputChange("pan_no", v)}
                focused={focusedInput === "pan_no"}
                onFocus={() => setFocusedInput("pan_no")}
                onBlur={() => setFocusedInput(null)}
              />
            </AccordionSection>

            {/* Customer Type */}
            <Text style={styles.label}>Customer Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCustomerType}
                onValueChange={(val) => setSelectedCustomerType(val)}
                style={styles.picker}
              >
                <Picker.Item label="Chit" value="chit" />
                <Picker.Item label="Gold Chit" value="goldChit" />
              </Picker>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[styles.addButton, isLoading && { opacity: 0.7 }]}
              onPress={handleAddCustomer}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>
                {isLoading ? "Please wait..." : "Add Customer"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

// Accordion Section Component
const AccordionSection = ({ title, expanded, onToggle, children }) => (
  <View style={styles.accordionSection}>
    <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
      <Text style={styles.accordionTitle}>{title}</Text>
      <Feather
        name={expanded ? "minus" : "plus"}
        size={20}
        color="#6C4AB6"
      />
    </TouchableOpacity>
    {expanded && <View style={styles.accordionContent}>{children}</View>}
  </View>
);

// Reusable Input Field Component
const InputField = ({
  label,
  icon,
  required,
  value,
  onChangeText,
  focused,
  onFocus,
  onBlur,
  keyboardType,
  secureTextEntry,
}) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={styles.label}>
      {label} {required && <Text style={{ color: "red" }}>*</Text>}
    </Text>
    <View style={[styles.inputGroup, focused && styles.inputGroupFocused]}>
      <Feather name={icon} size={18} color="#888" style={styles.icon} />
      <TextInput
        style={styles.textInput}
        placeholder={`Enter ${label}`}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    backgroundColor: "#6C4AB6",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 50,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  myCustomersButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
  },
  myCustomersButtonText: {
    color: "#6C4AB6",
    fontSize: 12,
    fontWeight: "bold",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    elevation: 4,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  inputGroupFocused: {
    borderWidth: 2,
    borderColor: "#6C4AB6",
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: "#000",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 5,
  },
  picker: {
    height: 50,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#6C4AB6",
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  accordionSection: {
    marginBottom: 15,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6C4AB6",
  },
  accordionContent: {
    paddingTop: 10,
  },
});

export default AddCustomer;
