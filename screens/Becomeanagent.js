import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import baseUrl from "../constants/baseUrl";

// Enable smooth animation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Becomeanagent = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [agent_full_name, setAgentFullName] = useState("");
  const [agent_email, setAgentEmail] = useState("");
  const [agent_phone_number, setAgentPhoneNumber] = useState("");
  const [agent_address, setAgentAddress] = useState("");
  const [agent_id_proof_type, setAgentIdProofType] = useState("");
  const [agent_id_proof_number, setAgentIdProofNumber] = useState("");
  const [agent_bank_account_number, setAgentBankAccountNumber] = useState("");
  const [agent_bank_account_ifsc_code, setAgentBankAccountIfscCode] = useState("");
  const [agent_experience, setAgentExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Expand/collapse states
  const [showPersonal, setShowPersonal] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [showBank, setShowBank] = useState(false);

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === "personal") setShowPersonal(!showPersonal);
    else if (section === "verification") setShowVerification(!showVerification);
    else if (section === "bank") setShowBank(!showBank);
  };

  const validateForm = () => {
    if (
      !agent_full_name ||
      !agent_email ||
      !agent_phone_number ||
      !agent_address ||
      !agent_id_proof_type ||
      !agent_id_proof_number ||
      !agent_bank_account_number ||
      !agent_bank_account_ifsc_code
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all required fields.",
        position: "bottom",
      });
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(agent_email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
        position: "bottom",
      });
      return false;
    }
    if (!/^\d{10}$/.test(agent_phone_number)) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Please enter a 10-digit number.",
        position: "bottom",
      });
      return false;
    }
    return true;
  };

  const handleSubmitApplication = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formData = {
        agent_full_name,
        agent_email,
        agent_phone_number,
        agent_address,
        agent_id_proof_type,
        agent_id_proof_number,
        agent_bank_account_number,
        agent_bank_account_ifsc_code,
        agent_experience,
        status: "pending",
        appliedAt: new Date().toISOString(),
      };

      const response = await axios.post(`${baseUrl}/become-agent/agents/become`, formData);

      if (response.status === 200 || response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Application Submitted!",
          text2: "We’ll review your application soon.",
          position: "bottom",
        });
        setAgentFullName("");
        setAgentEmail("");
        setAgentPhoneNumber("");
        setAgentAddress("");
        setAgentIdProofType("");
        setAgentIdProofNumber("");
        setAgentBankAccountNumber("");
        setAgentBankAccountIfscCode("");
        setAgentExperience("");
      } else {
        Toast.show({
          type: "info",
          text1: "Submission Issue",
          text2: response.data.message || "Something went wrong.",
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("Error submitting agent application:", error);
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: "Please try again later.",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : insets.top },
      ]}
    >
      <LinearGradient colors={["#4B0082", "#7B2CBF", "#9D4EDD"]} style={styles.backgroundGradient}>
        <StatusBar backgroundColor="#4B0082" barStyle="light-content" />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agent Application Form</Text>
        </View>

        <View style={styles.headerSubtitleBox}>
          <Text style={styles.headerSubtitleText}>Fill in your details to apply as an Agent</Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formCard}>
              {/* Personal Info Section */}
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("personal")}
              >
                <Text style={styles.formSectionTitle}>Personal Information</Text>
                <Ionicons
                  name={showPersonal ? "remove-circle-outline" : "add-circle-outline"}
                  size={24}
                  color="#7B2CBF"
                />
              </TouchableOpacity>

              {showPersonal && (
                <View style={styles.sectionContent}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    value={agent_full_name}
                    onChangeText={setAgentFullName}
                    placeholderTextColor="#888"
                  />

                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    value={agent_email}
                    onChangeText={setAgentEmail}
                    keyboardType="email-address"
                    placeholderTextColor="#888"
                  />

                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit number"
                    value={agent_phone_number}
                    onChangeText={setAgentPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#888"
                  />

                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter full address"
                    value={agent_address}
                    onChangeText={setAgentAddress}
                    multiline
                    placeholderTextColor="#888"
                  />
                </View>
              )}

              {/* Verification Section */}
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("verification")}
              >
                <Text style={styles.formSectionTitle}>Verification Details</Text>
                <Ionicons
                  name={showVerification ? "remove-circle-outline" : "add-circle-outline"}
                  size={24}
                  color="#7B2CBF"
                />
              </TouchableOpacity>

              {showVerification && (
                <View style={styles.sectionContent}>
                  <Text style={styles.inputLabel}>ID Proof Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Aadhaar / PAN / Voter ID"
                    value={agent_id_proof_type}
                    onChangeText={setAgentIdProofType}
                    placeholderTextColor="#888"
                  />

                  <Text style={styles.inputLabel}>ID Proof Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter ID number"
                    value={agent_id_proof_number}
                    onChangeText={setAgentIdProofNumber}
                    placeholderTextColor="#888"
                  />
                </View>
              )}

              {/* Bank Details Section */}
              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("bank")}>
                <Text style={styles.formSectionTitle}>Bank Details</Text>
                <Ionicons
                  name={showBank ? "remove-circle-outline" : "add-circle-outline"}
                  size={24}
                  color="#7B2CBF"
                />
              </TouchableOpacity>

              {showBank && (
                <View style={styles.sectionContent}>
                  <Text style={styles.inputLabel}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter bank account number"
                    value={agent_bank_account_number}
                    onChangeText={setAgentBankAccountNumber}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />

                  <Text style={styles.inputLabel}>IFSC Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter IFSC code"
                    value={agent_bank_account_ifsc_code}
                    onChangeText={setAgentBankAccountIfscCode}
                    autoCapitalize="characters"
                    placeholderTextColor="#888"
                  />

                  <Text style={styles.inputLabel}>Experience (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., 2 years in sales or chit management"
                    value={agent_experience}
                    onChangeText={setAgentExperience}
                    multiline
                    placeholderTextColor="#888"
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmitApplication}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backgroundGradient: { flex: 1 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: { marginRight: 10, padding: 6 },
  headerTitle: { color: "#fff", fontSize: 25, fontWeight: "700" },
  headerSubtitleBox: { marginTop: 80, alignItems: "center", marginBottom: 10 },
  headerSubtitleText: { color: "#E0D7FF", fontSize: 14, textAlign: "center" },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 40, paddingTop: 20 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionContent: { marginBottom: 10 },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7B2CBF",
  },
  inputLabel: { fontSize: 14, color: "#000", fontWeight: "600", marginBottom: 5 },
  input: {
    backgroundColor: "#F6F0FF",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#9D4EDD",
    marginBottom: 15,
    color: "#000",
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  submitButton: {
    backgroundColor: "#7B2CBF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4B0082",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 20,
  },
  submitButtonDisabled: { backgroundColor: "#C9A9E5" },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 0.3 },
});

export default Becomeanagent;
