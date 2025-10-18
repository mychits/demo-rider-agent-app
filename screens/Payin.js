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
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { Buffer } from "buffer";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";

import COLORS from "../constants/color";
import Button from "../components/Button";
import baseUrl from "../constants/baseUrl";
import { AgentContext } from "../context/AgentContextProvider";

const Payin = ({ route, navigation }) => {
  const { user, customer } = route.params;
  const { modifyPayment } = useContext(AgentContext);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [receipt, setReceipt] = useState({});
  const [paymentDetails, setPaymentDetails] = useState("cash");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [customerInfo, setCustomerInfo] = useState({});
  const [groups, setGroups] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [allData, setAllData] = useState([]);
  const [url, setUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [customerLoaded, setCustomerLoaded] = useState(false);
  const [enrollmentLoaded, setEnrollmentLoaded] = useState(false);
  const [receiptLoaded, setReceiptLoaded] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`${baseUrl}/user/get-user-by-id/${customer}`);
        if (response.data) setCustomerInfo(response.data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setCustomerLoaded(true);
      }
    };
    fetchCustomer();
  }, [customer]);

  useEffect(() => {
    const fetchEnrollDetails = async () => {
      try {
        const response = await axios.post(`${baseUrl}/enroll/get-user-tickets/${customer}`);
        setAllData(response.data);

        const uniqueGroups = response.data
          .filter((group) => group.group_id !== null)
          .reduce((acc, group) => {
            if (!acc.some((g) => g.group_id.group_name === group.group_id.group_name)) {
              acc.push(group);
            }
            return acc;
          }, []);

        setGroups(uniqueGroups);
        if (uniqueGroups.length === 1) {
          const groupId = uniqueGroups[0].group_id._id;
          setSelectedGroup(groupId);
          const groupTickets = response.data
            .filter((item) => item.group_id && item.group_id._id === groupId)
            .map((item) => item.tickets);
          setTickets(groupTickets);
          if (groupTickets.length === 1) setSelectedTicket(groupTickets[0].toString());
        }
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
      } finally {
        setEnrollmentLoaded(true);
      }
    };
    fetchEnrollDetails();
  }, [customer]);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axios.get(`${baseUrl}/payment/get-latest-receipt`);
        setReceipt(response.data);
      } catch (error) {
        console.error("Error fetching latest receipt:", error);
      } finally {
        setReceiptLoaded(true);
      }
    };
    fetchReceipt();
  }, []);

  useEffect(() => {
    if (customerLoaded && enrollmentLoaded && receiptLoaded) {
      setIsInitialLoading(false);
    }
  }, [customerLoaded, enrollmentLoaded, receiptLoaded]);

  const handleDateChange = (event, selectedDate) => {
    const newDate = selectedDate || currentDate;
    setShowDatePicker(Platform.OS === "ios");
    setCurrentDate(newDate);
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setSelectedTicket("");
    if (groupId) {
      const groupTickets = allData
        .filter((item) => item.group_id && item.group_id._id === groupId)
        .map((item) => item.tickets);
      setTickets(groupTickets);
      if (groupTickets.length === 1) setSelectedTicket(groupTickets[0].toString());
    } else {
      setTickets([]);
    }
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentDetails(type);
    if (type === "online") setAdditionalInfo("Transaction ID");
    else if (type === "cheque") setAdditionalInfo("Cheque Number");
    else setAdditionalInfo("");
    setTransactionId("");
  };

  const handleAddPayment = async () => {
    if (!customerInfo.full_name || !selectedGroup || !selectedTicket || !currentDate || !amount) {
      Alert.alert("Validation Error", "Please fill all mandatory fields.");
      return;
    }
    setIsLoading(true);
    try {
      const data = {
        user_id: customer,
        group_id: selectedGroup,
        ticket: selectedTicket,
        pay_date: moment(currentDate).format("YYYY-MM-DD"),
        receipt_no: String(receipt.receipt_no || ""),
        pay_type: paymentDetails,
        amount: amount,
        transaction_id: transactionId,
        collected_by: user.userId,
      };
      const response = await axios.post(`${baseUrl}/payment/add-payment`, data);
      if (response.status === 201) {
        Alert.alert("Success", "Payment added successfully!");
        navigation.navigate("Print", { store_id: response.data._id });
      }
    } catch (error) {
      Alert.alert("Payment Error", "Failed to add payment. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQrCode = async () => {
    try {
      setQrLoading(true);
      const response = await axios.post(`${baseUrl}/qrcode?amount=${amount}`, {}, { responseType: "arraybuffer" });
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      setUrl(`data:image/png;base64,${base64}`);
      setModalVisible(true);
    } catch (error) {
      console.error("QR generation error:", error);
    } finally {
      setQrLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C2DC7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8FF" }}>
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>MyChits Payment</Text>
            <Text style={styles.modalSubTitle}>Pay ₹{amount}</Text>
            <Image source={{ uri: url }} style={styles.qrImage} resizeMode="contain" />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LinearGradient colors={["#6C2DC7", "#3B1E7A"]} style={styles.gradientOverlay} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ marginHorizontal: 8, marginTop: 12 }}>
              {/* ✅ Custom Header */}
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Icon name="arrow-left" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Payment</Text>
              </View>

              

              <View style={styles.formBox}>
                {/* Form Fields */}
                <Text style={styles.label}>Name<Text style={styles.star}>*</Text></Text>
                <TextInput style={styles.textInput} value={customerInfo.full_name} editable={false} />

                <Text style={styles.label}>Group<Text style={styles.star}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={selectedGroup} onValueChange={handleGroupChange} style={styles.picker}>
                    <Picker.Item label="Select Group" value="" />
                    {groups.map((g, i) => (
                      <Picker.Item key={i} label={g.group_id.group_name} value={g.group_id._id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Ticket<Text style={styles.star}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={selectedTicket} onValueChange={setSelectedTicket} style={styles.picker}>
                    <Picker.Item label="Select Ticket" value="" />
                    {tickets.map((t, i) => (
                      <Picker.Item key={i} label={`${t}`} value={t.toString()} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Date<Text style={styles.star}>*</Text></Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <TextInput
                        style={styles.textInput}
                        value={moment(currentDate).format("DD-MM-YYYY")}
                        editable={false}
                      />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker value={currentDate} mode="date" display="default" onChange={handleDateChange} />
                    )}
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>Receipt<Text style={styles.star}>*</Text></Text>
                    <TextInput style={styles.textInput} value={String(receipt.receipt_no || "")} editable={false} />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Payment Type<Text style={styles.star}>*</Text></Text>
                    <View style={styles.pickerContainer}>
                      <Picker selectedValue={paymentDetails} onValueChange={handlePaymentTypeChange} style={styles.picker}>
                        <Picker.Item label="Cash" value="cash" />
                        <Picker.Item label="Online" value="online" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>Amount<Text style={styles.star}>*</Text></Text>
                    <TextInput style={styles.textInput} keyboardType="numeric" value={amount} onChangeText={setAmount} />
                  </View>
                </View>

                {additionalInfo !== "" && (
                  <>
                    <Text style={styles.label}>{additionalInfo}<Text style={styles.star}>*</Text></Text>
                    <TextInput
                      style={styles.textInput}
                      value={transactionId}
                      onChangeText={setTransactionId}
                      placeholder={`Enter ${additionalInfo}`}
                    />
                  </>
                )}

                <View style={[styles.buttonContainer, !(amount && paymentDetails === "online") && styles.centeredButton]}>
                  {amount && paymentDetails === "online" && (
                    <TouchableOpacity onPress={generateQrCode} style={styles.qrButton}>
                      {qrLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <MaterialIcons name="qr-code-2" size={40} color="#fff" />
                      )}
                    </TouchableOpacity>
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  gradientOverlay: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "#500",
    marginLeft: 60,
    textTransform: "uppercase",
    alignItems:"center",
    marginVertical: 8
  },
  titleContainer: { alignItems: "center", marginVertical: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  label: { fontWeight: "bold", color: "#3B1E7A" },
  star: { color: "red" },
  textInput: {
    height: 55,
    borderColor: "#C7B3FF",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "#F8F6FF",
    color: "#000",
  },
  pickerContainer: {
    borderColor: "#C7B3FF",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#F8F6FF",
    marginVertical: 10,
  },
  picker: { height: 50, color: "#3B1E7A" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1, marginHorizontal: 5 },
  qrButton: {
    flex: 1,
    backgroundColor: "#6C2DC7",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    height: 55,
  },
  button: {
    flex: 5,
    margin: 5,
    backgroundColor: "#3B1E7A",
    height: 55,
  },
  buttonContainer: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  centeredButton: { justifyContent: "center" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: 320,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#3B1E7A", marginBottom: 5 },
  modalSubTitle: { fontSize: 16, color: "#555", marginBottom: 15 },
  qrImage: { width: 240, height: 240, marginBottom: 20 },
  cancelButton: { backgroundColor: "#6C2DC7", paddingVertical: 12, borderRadius: 8, width: "100%" },
  cancelButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});

export default Payin;
