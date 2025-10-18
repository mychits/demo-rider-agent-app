import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import RNPrint from "react-native-print";
import { LinearGradient } from "expo-linear-gradient";

import COLORS from "../constants/color";
import Header from "../components/Header";
import baseUrl from "../constants/baseUrl";
import axios from "axios";
import PaymentChitList from "../components/PaymentChitList";

const noImage = require("../assets/no.png");

// Violet Theme
const THEME = {
  primary: "#6C2DC7",
  deep: "#3B1E7A",
  lightTint: "#F2E9FF",
  bg: "#FAF8FF",
  card: "#FFFFFF",
  muted: "#7A7A7A",
  border: "#E8E2F8",
};

const LoanPayments = ({ route, navigation }) => {
  const { user, areaId } = route.params;

  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [cus, setCus] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState({});

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [activeChitId, setActiveChitId] = useState(null);
  const [showTotalCollectionDetails, setShowTotalCollectionDetails] = useState(false);

  const paymentModes = ["cash", "online"];

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const [filters, setFilters] = useState([
    { id: "date", title: "Date", value: formatDate(new Date()), icon: "calendar" },
    { id: "customer", title: "Customer", value: "All", icon: "user" },
    { id: "group", title: "Group", value: "All", icon: "users" },
    { id: "paymentMode", title: "Payment Mode", value: "All", icon: "money" },
    { id: "totalCollection", title: "Total Collection", value: "...", icon: "money" },
  ]);

  // Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [paymentsRes, usersRes, groupsRes, agentRes] = await Promise.all([
          axios.get(`${baseUrl}/payment/get-payment-agent/${user.userId}`),
          axios.get(`${baseUrl}/user/get-user`),
          axios.get(`${baseUrl}/group/get-group`),
          axios.get(`${baseUrl}/agent/get-agent-by-id/${user.userId}`),
        ]);
        setCustomers(paymentsRes.data || []);
        setCus(usersRes.data || []);
        setGroups(groupsRes.data || []);
        setAgent(agentRes.data || {});
      } catch (err) {
        console.error("Fetch error:", err);
        Alert.alert("Network Error", "Failed to fetch data. Check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user.userId]);

  // Filter logic
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((customer) => {
        const nameMatch = (customer?.user_id?.full_name || "").toLowerCase().includes(search.toLowerCase());
        const dateMatch = isSameDate(customer.pay_date, selectedDate);
        const customerMatch = !selectedCustomer || customer?.user_id?._id === selectedCustomer;
        const groupMatch = !selectedGroup || customer?.group_id?._id === selectedGroup;
        const paymentModeMatch = !selectedPaymentMode || customer.pay_type === selectedPaymentMode;
        return nameMatch && dateMatch && customerMatch && groupMatch && paymentModeMatch;
      })
    : [];

  const totalAmount = filteredCustomers.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  useEffect(() => {
    setFilters((prev) =>
      prev.map((f) => (f.id === "totalCollection" ? { ...f, value: `₹ ${totalAmount.toFixed(2)}` } : f))
    );
  }, [totalAmount]);

  const handleFilterPress = (filterId) => {
    if (filterId === "totalCollection") {
      setSelectedFilter(filterId);
      setShowTotalCollectionDetails(true);
    } else {
      setSelectedFilter(filterId);
      setShowPicker(true);
    }
  };

  const updateFilterValue = (id, value) =>
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, value: value || "All" } : f)));

  const renderPicker = () => {
    switch (selectedFilter) {
      case "group":
        return (
          <Picker
            selectedValue={selectedGroup}
            onValueChange={(value) => {
              const sel = groups.find((g) => g._id === value);
              setSelectedGroup(value);
              updateFilterValue("group", sel?.group_name || "All");
              setShowPicker(false);
            }}
          >
            <Picker.Item label="All Groups" value="" />
            {groups.map((g) => (
              <Picker.Item key={g._id} label={g.group_name} value={g._id} />
            ))}
          </Picker>
        );
      case "customer":
        return (
          <Picker
            selectedValue={selectedCustomer}
            onValueChange={(value) => {
              const sel = cus.find((c) => c._id === value);
              setSelectedCustomer(value);
              updateFilterValue("customer", sel?.full_name || "All");
              setShowPicker(false);
            }}
          >
            <Picker.Item label="All Customers" value="" />
            {cus.map((c) => (
              <Picker.Item key={c._id} label={`${c.full_name} - ${c.phone_number}`} value={c._id} />
            ))}
          </Picker>
        );
      case "paymentMode":
        return (
          <Picker
            selectedValue={selectedPaymentMode}
            onValueChange={(value) => {
              setSelectedPaymentMode(value);
              updateFilterValue("paymentMode", value || "All");
              setShowPicker(false);
            }}
          >
            <Picker.Item label="All" value="" />
            {paymentModes.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        );
      default:
        return null;
    }
  };

  // Printing (same as before)
  const printPDF = async () => {
    try {
      const rows = filteredCustomers
        .map(
          (c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${c?.group_id?.group_name || "N/A"}</td>
          <td>${c.ticket || "N/A"}</td>
          <td>${c?.user_id?.full_name || "N/A"}</td>
          <td>${c?.user_id?.phone_number || "N/A"}</td>
          <td>${c.amount || "N/A"}</td>
          <td>${c.receipt_no || "N/A"}</td>
          <td>${c.pay_type || "N/A"}</td>
        </tr>`
        )
        .join("");

      const html = `
      <html><head><style>
      body{font-family:Arial;padding:10px;}
      table{width:100%;border-collapse:collapse;}
      th,td{border:1px solid #ccc;padding:5px;}
      </style></head><body>
      <h2>Chit Collection Sheet</h2>
      <table>
        <tr><th>#</th><th>Group</th><th>Ticket</th><th>Name</th><th>Phone</th><th>Amount</th><th>Receipt</th><th>Mode</th></tr>
        ${rows}
      </table>
      <p>Total: ₹ ${totalAmount.toFixed(2)}</p>
      </body></html>`;

      await RNPrint.print({ html });
    } catch (err) {
      Alert.alert("Error", "Failed to print document");
    }
  };

  // Total summary print
  const printTotalCollectionDetails = async () => {
    const html = `
      <html><head><style>
      body{font-family:Arial;text-align:center;padding:10px;}
      h1{color:${THEME.primary}}
      </style></head><body>
      <h1>Total Collection Summary</h1>
      <h2>₹ ${totalAmount.toFixed(2)}</h2>
      <p>Agent: ${agent.name || "N/A"}</p>
      <p>Date: ${formatDate(selectedDate)}</p>
      </body></html>`;
    await RNPrint.print({ html });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[THEME.primary, THEME.deep]} style={styles.headerBg}>
        <Header />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Loan Collection Sheet</Text>
          <Text style={styles.headerSubtitle}>View, verify & record daily Loan collections</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>Total Collection</Text>
              <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.totalPrintBtn} onPress={printTotalCollectionDetails}>
              <Icon name="print" size={16} color="#fff" />
              <Text style={styles.totalPrintText}>Print</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <Icon name="search" size={16} color={THEME.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customer or group..."
              placeholderTextColor={THEME.muted}
              style={styles.searchInput}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterCard, selectedFilter === f.id && styles.filterCardActive]}
                onPress={() => handleFilterPress(f.id)}
              >
                <Icon name={f.icon} size={16} color={THEME.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.filterTitle}>{f.title}</Text>
                  <Text style={styles.filterValue}>{f.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.printPdfBtn} onPress={printPDF}>
              <Icon name="file-text-o" size={14} color="#fff" />
              <Text style={styles.printPdfText}>Export</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ✅ Fixed Date Picker Rendering */}
          {showPicker && selectedFilter === "date" ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (event.type === "set" && date) {
                  setSelectedDate(date);
                  updateFilterValue("date", formatDate(date));
                }
                setShowPicker(false);
              }}
            />
          ) : (
            <Modal
              visible={showPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowPicker(false)}
            >
              <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowPicker(false)}>
                <View style={styles.pickerCard}>{renderPicker()}</View>
              </TouchableOpacity>
            </Modal>
          )}

          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }}>
            {filteredCustomers.length === 0 ? (
              <View style={styles.noData}>
                <Image source={noImage} style={styles.noImage} />
                <Text style={styles.noText}>No Payments are available</Text>
              </View>
            ) : (
              filteredCustomers.map((customer, index) => (
                <PaymentChitList
                  key={index}
                  idx={index}
                  name={customer?.user_id?.full_name || "N/A"}
                  phone={customer?.user_id?.phone_number || "N/A"}
                  receipt={customer.receipt_no}
                  date={customer.pay_date}
                  amount={customer.amount}
                  group={customer?.group_id?.group_name || "N/A"}
                  type={customer.pay_type}
                  navigation={navigation}
                  user={user}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  headerBg: { paddingTop: 12, paddingBottom: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerContent: { alignItems: "center", marginTop: 2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, textAlign: "center" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 12 },
  totalCard: {
    backgroundColor: THEME.card,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  totalLabel: { color: THEME.muted, fontSize: 13 },
  totalValue: { color: THEME.deep, fontSize: 20, fontWeight: "700", marginTop: 6 },
  totalPrintBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  totalPrintText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  searchWrap: {
    backgroundColor: THEME.card,
    marginHorizontal: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 14, color: "#222" },
  filtersRow: { marginBottom: 8, marginTop: 4, paddingHorizontal: 16 },
  filterCard: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  filterCardActive: { backgroundColor: THEME.lightTint },
  filterTitle: { fontSize: 12, color: "#444", fontWeight: "600" },
  filterValue: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  printPdfBtn: {
    backgroundColor: THEME.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  printPdfText: { color: "#fff", marginLeft: 8, fontWeight: "600", fontSize: 13 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  pickerCard: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 12 },
  list: { marginTop: 8, paddingHorizontal: 8 },
  noData: { alignItems: "center", marginTop: 40 },
  noImage: { width: 200, height: 120, resizeMode: "contain", opacity: 0.85 },
  noText: { marginTop: 12, fontSize: 14, color: THEME.muted },
});

export default LoanPayments;
