import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";

import COLORS from "../constants/color";
import Header from "../components/Header";
import Button from "../components/Button";
import baseUrl from "../constants/baseUrl";

const PigmePayin = ({ route, navigation }) => {
  const { user, customer, pigme_id, custom_pigme_id } = route.params;

  const [currentDate, setCurrentDate] = useState("");
  const [receipt, setReceipt] = useState({});
  const [paymentDetails, setPaymentDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [customerInfo, setCustomerInfo] = useState("");
  const [pigmeData, setPigmeData] = useState([]);
  const [selectedPigme, setSelectedPigme] = useState(null);
  const [agent, setAgent] = useState(null);

  // Fetch Pigme data
  useEffect(() => {
    const fetchCustomerPigme = async () => {
      setIsFetchingData(true);
      try {
        const response = await axios.get(`${baseUrl}/pigme/get-pigme/${pigme_id}`);
        if (response.data) {
          const fetchedPigme = response.data;
          const customerName = fetchedPigme.customer?.full_name || "N/A";
          setCustomerInfo(customerName);
          const dataArray = [fetchedPigme];
          setPigmeData(dataArray);
          if (dataArray.length === 1) {
            setSelectedPigme(dataArray[0]);
            setAmount(String(dataArray[0].payable_amount || ""));
          }
        }
      } catch (error) {
        console.error("Error fetching customer pigme data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchCustomerPigme();
  }, [pigme_id]);

  // Set current date
  useEffect(() => {
    setCurrentDate(moment().format("DD-MM-YYYY"));
  }, []);

  // Fetch latest receipt
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axios.get(`${baseUrl}/payment/get-latest-receipt`);
        setReceipt(response.data);
      } catch (error) {
        console.error("Error fetching latest receipt:", error);
      }
    };
    fetchReceipt();
  }, []);

  // Fetch agent info
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await axios.get(`${baseUrl}/agent/get-agent-by-id/${user.userId}`);
        if (response.data) setAgent(response.data);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };
    if (user?.userId) fetchAgent();
  }, [user.userId]);

  // Payment type change
  const handlePaymentTypeChange = (type) => {
    setPaymentDetails(type);
    setTransactionId("");
    if (type === "online") setAdditionalInfo("Transaction ID");
    else if (type === "cheque") setAdditionalInfo("Cheque Number");
    else setAdditionalInfo("");
  };

  // Add payment
  const handleAddPayment = async () => {
    setIsLoading(true);
    try {
      if (!selectedPigme || !paymentDetails || !amount || (paymentDetails !== "cash" && !transactionId)) {
        Alert.alert("Validation Error", "Please fill all mandatory fields.");
        setIsLoading(false);
        return;
      }

      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        Alert.alert("Validation Error", "Please enter a valid amount.");
        setIsLoading(false);
        return;
      }

      const PigmeId = selectedPigme?._id;
      const data = {
        user_id: customer,
        pay_date: new Date().toISOString().split("T")[0],
        pay_type: paymentDetails,
        amount: amount,
        transaction_id: transactionId,
        collected_by: user?.userId,
        pay_for: "Pigme",
        pigme_id: PigmeId,
      };

      const response = await axios.post(`${baseUrl}/payment/pigme/${PigmeId}`, data);

      if (response.status === 201) {
        Alert.alert("Success", "Payment added successfully!");
        const userResponse = await axios.get(`${baseUrl}/user/get-user-by-id/${customer}`);
        const { full_name, phone_number } = userResponse.data;
        const { pay_date, amount: paidAmount, pay_type, transaction_id: tId, receipt_no } =
          response.data?.response;
        const agentName = agent?.name || "N/A";

        const totalAmountResponse = await axios.post(`${baseUrl}/payment/get-total-amount`, {
          user_id: customer,
          pigme: pigme_id,
        });

        navigation.navigate("PigmePrint", {
          customer_name: full_name,
          phone_number,
          agent_name: agentName,
          amount: paidAmount,
          pay_type,
          pay_date,
          transaction_id: tId,
          receipt_no,
          total_amount: totalAmountResponse?.data?.totalAmount || 0,
          custom_pigme_id,
          isPigmePayment: true,
          pigme_id,
        });
      } else {
        Alert.alert("Error", response.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      Alert.alert("Error", "Error adding payment. Please check your network or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={["#6C2DC7", "#3B1E7A"]} style={styles.gradientOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#6C2DC7", "#3B1E7A"]} style={styles.gradientOverlay}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginHorizontal: 20, marginTop: 12 }}>
              <Header />
              <View style={styles.titleContainer}>
                <Text style={styles.title}> Add Pigme Payment💰</Text>
                <Text style={styles.subtitle}>
                  Record and verify Pigme payments seamlessly in violet theme.
                </Text>
              </View>

              <View style={styles.formBox}>
                {/* Customer Name */}
                <Text style={styles.label}>
                  Customer Name<Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={customerInfo || "N/A"}
                  editable={false}
                />

                {/* Pigme ID */}
                <Text style={styles.label}>
                  Pigme ID & Payable Amount<Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={
                    selectedPigme
                      ? `ID: ${selectedPigme.pigme_id} | ₹${selectedPigme.payable_amount}`
                      : "Loading..."
                  }
                  editable={false}
                />

                {/* Date & Receipt */}
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Date<Text style={styles.star}>*</Text></Text>
                    <TextInput style={styles.textInput} value={currentDate} editable={false} />
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>Receipt<Text style={styles.star}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      value={receipt.receipt_no ? String(receipt.receipt_no) : "N/A"}
                      editable={false}
                    />
                  </View>
                </View>

                {/* Payment Type & Amount */}
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Payment Type<Text style={styles.star}>*</Text></Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={paymentDetails}
                        onValueChange={handlePaymentTypeChange}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select" value="" />
                        <Picker.Item label="Cash" value="cash" />
                        <Picker.Item label="Online" value="online" />
                        <Picker.Item label="Cheque" value="cheque" />
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>Amount<Text style={styles.star}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter Amount"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                </View>

                {/* Transaction / Cheque */}
                {additionalInfo !== "" && (
                  <>
                    <Text style={styles.label}>
                      {additionalInfo}
                      <Text style={styles.star}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={`Enter ${additionalInfo}`}
                      value={transactionId}
                      onChangeText={setTransactionId}
                    />
                  </>
                )}

                <Button
                  title={isLoading ? "Please wait..." : "Add Payment"}
                  filled
                  disabled={isLoading}
                  style={styles.button}
                  onPress={handleAddPayment}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    flex: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#E5E5E5",
    textAlign: "center",
    marginTop: 4,
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    marginVertical: 10,
    height: 50,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  star: {
    color: "red",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#6C2DC7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
});

export default PigmePayin;
