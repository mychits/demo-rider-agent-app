import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import baseUrl from "../constants/baseUrl";

const MonthlyTurnover = () => {
  const [turnoverData, setTurnoverData] = useState(null);
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState(moment().format("MMMM YYYY"));
  const [searchText, setSearchText] = useState("");

  // ✅ Fetch turnover data when date changes
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(await AsyncStorage.getItem("user"));
        const agentId = user?.userId;
        if (!agentId) {
          setError("No agentId found. Please login again.");
          setLoading(false);
          return;
        }

        const year = moment(selectedDate).year();
        const month = moment(selectedDate).month() + 1;
        const apiUrl = `${baseUrl}/user/agent-monthly-turnover-by-id/${agentId}?year=${year}&month=${month}`;
        const response = await axios.get(apiUrl);

        if (response.data?.success) {
          setTurnoverData(response.data.agentData);
          const customersWithStatus = response.data.agentData.payingCustomers.map((c) => {
            const totalPaid = parseFloat(c.totalPaid);
            const monthlyInstallment = parseFloat(c.monthly_installment);
            let lastPaymentDate = null;
            if (c.payments?.length > 0) {
              lastPaymentDate = c.payments
                .map((p) => p.pay_date)
                .sort((a, b) => new Date(b) - new Date(a))[0];
            }
            return {
              ...c,
              paymentStatus: totalPaid >= monthlyInstallment ? "PAID" : "UNPAID",
              lastPaymentDate,
            };
          });
          setCustomersData(customersWithStatus);
        } else {
          setError("Failed to fetch data.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Please check your network.");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedDate]);

  const onDateChange = (_event, newDate) => {
    setShowPicker(false);
    if (newDate) {
      const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      setSelectedDate(firstDay);
      setFormattedDate(moment(firstDay).format("MMMM YYYY"));
    }
  };

  // ✅ Debounce for better performance (no flicker)
  const [debouncedText, setDebouncedText] = useState(searchText);
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedText(searchText), 400);
    return () => clearTimeout(delay);
  }, [searchText]);

  // ✅ Filtered customers (memoized)
  const filteredCustomers = useMemo(() => {
    const term = debouncedText.toLowerCase();
    return customersData.filter(
      (c) =>
        c.user_id.full_name.toLowerCase().includes(term) ||
        c.group_id.group_name.toLowerCase().includes(term)
    );
  }, [debouncedText, customersData]);

  // ✅ Render components (memoized)
  const renderTurnoverCard = useCallback(() => {
    if (!turnoverData) return null;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="user-tie" size={38} color="#6C2DC7" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.agentName}>{turnoverData.agentName}</Text>
            <Text style={styles.phoneNumber}>{turnoverData.phone_number}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.datePickerContainer}
          onPress={() => setShowPicker(true)}
        >
          <FontAwesome5 name="calendar-alt" size={18} color="#fff" />
          <Text style={styles.datePickerText}>{formattedDate}</Text>
          <FontAwesome5 name="chevron-down" size={14} color="#fff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <View style={styles.divider} />
        <View style={styles.cardBody}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Month-Year</Text>
            <Text style={styles.dataValue}>
              {turnoverData.month}/{turnoverData.year}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Total Customers</Text>
            <Text style={styles.dataValueTotal}>{turnoverData.totalCustomers}</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.cardFooter}>
          <View style={styles.turnoverSection}>
            <Text style={styles.turnoverLabel}>Expected</Text>
            <Text style={styles.turnoverValue}>₹{turnoverData.expectedTurnover}</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.turnoverSection}>
            <Text style={styles.turnoverLabel}>Actual</Text>
            <Text style={styles.turnoverValueAct}>₹{turnoverData.totalTurnover}</Text>
          </View>
        </View>
      </View>
    );
  }, [turnoverData, formattedDate]);

  const renderCustomerCard = useCallback(({ item }) => (
    <View style={styles.customerCard}>
      <View
        style={
          item.paymentStatus === "PAID"
            ? styles.paidBadgeContainer
            : styles.unpaidBadgeContainer
        }
      >
        <Text style={styles.badgeText}>{item.paymentStatus}</Text>
      </View>
      <View style={styles.customerContent}>
        <View style={styles.customerDetailRow}>
          <Text style={styles.customerLabel}>Customer:</Text>
          <Text style={styles.customerValue}>{item.user_id.full_name}</Text>
        </View>
        <View style={styles.customerDetailRow}>
          <Text style={styles.customerLabel}>Group:</Text>
          <Text style={styles.customerValue}>{item.group_id.group_name}</Text>
        </View>
        <View style={styles.customerDetailRow}>
          <Text style={styles.customerLabel}>Ticket:</Text>
          <Text style={styles.customerValue}>{item.ticket}</Text>
        </View>
        <View style={styles.customerDetailRow}>
          <Text style={styles.customerLabel}>Installment:</Text>
          <Text style={styles.customerInst}>₹{item.monthly_installment}</Text>
        </View>
        <View style={styles.customerDetailRow}>
          <Text style={styles.customerLabel}>Last Transaction:</Text>
          <Text style={styles.customerValue}>{item.lastPaymentDate || "—"}</Text>
        </View>
        <View style={styles.customerDetailRow}>
          <Text style={styles.customerLabel}>Total Paid:</Text>
          <Text style={styles.customerTotal}>₹{item.totalPaid}</Text>
        </View>
      </View>
    </View>
  ), []);

  // ✅ Main return
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#6C2DC7", "#9D50BB"]}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.mainContentArea}>
              <Header />
              <Text style={styles.screenTitle}>Monthly Revenue Summary</Text>
              <Text style={styles.instructionText}>
                A detailed overview of your revenue and financial performance by month.
              </Text>

              {loading ? (
                <ActivityIndicator size="large" color="#fff" style={styles.loader} />
              ) : error ? (
                <Text style={styles.statusText}>{error}</Text>
              ) : (
                <FlatList
                  data={filteredCustomers}
                  renderItem={renderCustomerCard}
                  keyExtractor={(_, index) => index.toString()}
                  ListHeaderComponent={
                    <>
                      {renderTurnoverCard()}
                      {customersData.length > 0 && (
                        <View style={styles.searchBarContainer}>
                          <Text style={styles.customersListTitle}>Customer Payment Status</Text>
                          <View style={styles.searchContainer}>
                            <FontAwesome5
                              name="search"
                              size={18}
                              color="#777"
                              style={styles.searchIcon}
                            />
                            <TextInput
                              style={styles.searchInput}
                              placeholder="Search by name or group"
                              placeholderTextColor="#999"
                              value={searchText}
                              onChangeText={setSearchText}
                              returnKeyType="search"
                              autoCorrect={false}
                              autoCapitalize="none"
                            />
                          </View>
                        </View>
                      )}
                    </>
                  }
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContent}
                  keyboardShouldPersistTaps="always" // ✅ keeps keyboard open
                />
              )}
            </View>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                onChange={onDateChange}
              />
            )}
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// --- styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  gradientOverlay: { flex: 1 },
  mainContentArea: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "#d1cacaff",
    textAlign: "center",
    marginBottom: 15,
  },
  loader: { marginTop: 50 },
  statusText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  flatListContent: { paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderColor: "#6C2DC7",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    marginTop: 15,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  headerTextContainer: { marginLeft: 15 },
  agentName: { fontSize: 20, fontWeight: "bold", color: "#111" },
  phoneNumber: { fontSize: 14, color: "#666" },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C2DC7",
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 10,
  },
  datePickerText: { fontSize: 16, fontWeight: "bold", color: "#fff", marginLeft: 8 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 10 },
  dataRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  dataLabel: { fontSize: 14, color: "#555" },
  dataValue: { fontSize: 15, fontWeight: "bold", color: "#111" },
  dataValueTotal: { fontSize:20, fontWeight: "bold", color: "#FFB201" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  turnoverSection: { flex: 1, alignItems: "center", padding: 5 },
  turnoverLabel: { fontSize: 14, color: "#6C2DC7", fontWeight: "bold" },
  turnoverValue: { fontSize: 17, fontWeight: "bold", color: "green" },
  turnoverValueAct: { fontSize: 17, fontWeight: "bold", color: "red" },

  verticalDivider: { width: 1, backgroundColor: "#EEE" },
  searchBarContainer: { marginTop: 20, marginBottom: 10 },
  customersListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111" },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  customerDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  customerLabel: { fontSize: 13, color: "#555" },
  customerValue: { fontSize: 14, fontWeight: "600", color: "#111" },
  customerInst: { fontSize: 14, fontWeight: "600", color: "#F5B642" },
  customerTotal: { fontSize: 14, fontWeight: "600", color: "#03b42fff" },

  paidBadgeContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  unpaidBadgeContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#E53935",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});

export default MonthlyTurnover;
