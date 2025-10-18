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
import url from "../constants/baseUrl";

const LoanPayin = ({ route, navigation }) => {
  const { user, customer, loan_id, custom_loan_id } = route.params;
  const [currentDate, setCurrentDate] = useState("");
  const [receipt, setReceipt] = useState({});
  const [paymentDetails, setPaymentDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({});
  const [loanData, setLoanData] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [agent, setAgent] = useState([]);
  const [singleLoanMode, setSingleLoanMode] = useState(false);

  useEffect(() => {
    const fetchCustomerAndLoan = async () => {
      setIsDataLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/loans/get-borrower/${loan_id}`);
        if (response.data && response.data.borrower) {
          setCustomerInfo(response.data.borrower);
          const loans = [response.data];
          setLoanData(loans);
          setSelectedLoan(loans[0]);
          setSingleLoanMode(loans.length === 1);
        } else {
          setLoanData([]);
          setSingleLoanMode(false);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load customer or loan details.");
        setLoanData([]);
        setSingleLoanMode(false);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchCustomerAndLoan();
  }, [customer, loan_id]);

  useEffect(() => {
    setCurrentDate(moment().format("DD-MM-YYYY"));
  }, []);

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

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await axios.get(`${baseUrl}/agent/get-agent-by-id/${user.userId}`);
        if (response.data) setAgent(response.data);
      } catch (error) {
        console.error("Error fetching agent:", error);
      }
    };
    fetchAgent();
  }, [user.userId]);

  const handlePaymentTypeChange = (type) => {
    setPaymentDetails(type);
    if (type === "online") {
      setAdditionalInfo("Transaction ID");
    } else if (type === "cheque") {
      setAdditionalInfo("Cheque Number");
    } else {
      setAdditionalInfo("");
    }
    setTransactionId("");
  };

  const handleAddPayment = async () => {
    setIsLoading(true);
    try {
      if (
        !selectedLoan ||
        !paymentDetails ||
        !amount ||
        (paymentDetails !== "cash" && !transactionId)
      ) {
        Alert.alert("Validation Error", "Please fill all mandatory fields.");
        setIsLoading(false);
        return;
      }

      const data = {
        user_id: customer,
        pay_date: new Date().toISOString().split("T")[0],
        amount: amount,
        pay_type: paymentDetails,
        ...(paymentDetails !== "cash" && { transaction_id: transactionId }),
        collected_by: user?.userId,
        pay_for: "Loan",
      };

      const loanId = selectedLoan?._id;
      const response = await axios.post(`${url}/payment/loan/${loanId}`, data);

      if (response.status === 201) {
        Alert.alert("Success", "Payment added successfully!");

        const userResponse = await axios.get(`${baseUrl}/user/get-user-by-id/${customer}`);
        const { full_name, phone_number } = userResponse.data;
        const { pay_date, amount, pay_type, transaction_id, receipt_no } =
          response.data?.response;

        const agentResponse = await axios.get(
          `${baseUrl}/agent/get-agent-by-id/${user.userId}`
        );
        const { name } = agentResponse.data;

        const totalAmountResponse = await axios.post(`${baseUrl}/payment/get-total-amount`, {
          user_id: customer,
          loan: loanId,
        });

        navigation.navigate("LoanPrint", {
          customer_name: full_name,
          phone_number,
          agent_name: name,
          amount,
          pay_type,
          pay_date,
          transaction_id,
          receipt_no,
          total_amount: totalAmountResponse?.data?.totalAmount || 0,
          custom_loan_id: selectedLoan.loan_id,
          isLoanPayment: true,
        });
      } else {
        Alert.alert("Payment Error", response.data?.message || "Unexpected error occurred.");
      }
    } catch (error) {
      Alert.alert("Error", "Error adding payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoanSelection = () => {
    if (singleLoanMode && selectedLoan) {
      return (
        <TextInput
          style={styles.textInput}
          value={`ID: ${selectedLoan.loan_id} | Amount: ${selectedLoan.loan_amount}`}
          editable={false}
        />
      );
    }

    return (
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLoan}
          onValueChange={(itemValue) => setSelectedLoan(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Loan" value={null} />
          {loanData.map((loan, index) => (
            <Picker.Item
              key={index}
              label={`ID: ${loan.loan_id} | Amount: ${loan.loan_amount}`}
              value={loan}
            />
          ))}
        </Picker>
      </View>
    );
  };

  const renderContent = () => {
    if (isDataLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C2DC7" />
        </View>
      );
    }

    if (!customerInfo.full_name || loanData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No open loans found for this customer.</Text>
          <Button title="Go Back" filled onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.formBox}>
          <Text style={styles.label}>Name<Text style={styles.star}>*</Text></Text>
          <TextInput style={styles.textInput} value={customerInfo.full_name} editable={false} />

          <Text style={styles.label}>Loan ID & Amount<Text style={styles.star}>*</Text></Text>
          {renderLoanSelection()}

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Date<Text style={styles.star}>*</Text></Text>
              <TextInput style={styles.textInput} value={currentDate} editable={false} />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Receipt<Text style={styles.star}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                value={receipt.receipt_no ? String(receipt.receipt_no) : ""}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Payment Type<Text style={styles.star}>*</Text></Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={paymentDetails}
                  onValueChange={(itemValue) => handlePaymentTypeChange(itemValue)}
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

          {additionalInfo !== "" && (
            <>
              <Text style={styles.label}>{additionalInfo}<Text style={styles.star}>*</Text></Text>
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
            disabled={isLoading || !selectedLoan}
            style={styles.button}
            onPress={handleAddPayment}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ marginHorizontal: 22, marginTop: 12 }}>
              <Header />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>💰 Add Loan Payment</Text>
                <Text style={styles.subtitle}>Record secure and verified customer payments</Text>
              </View>
              {renderContent()}
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
    marginTop: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#E5E0FF",
    textAlign: "center",
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 0,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 3,
  },
  textInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
    color: "#000",
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 10,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    color: "#3B1E7A",
  },
  star: {
    color: "red",
  },
  button: {
    marginTop: 18,
    backgroundColor: "#6C2DC7",
  },
});

export default LoanPayin;
