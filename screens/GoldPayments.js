import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import RNPrint from "react-native-print";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Header from "../components/Header";
import PaymentChitList from "../components/PaymentChitList";
import baseUrl from "../constants/baseUrl";

const noImage = require("../assets/no.png");

// Local violet theme
const THEME = {
  primary: "#6C2DC7",
  deep: "#3B1E7A",
  lightTint: "#F2E9FF",
  bg: "#FAF8FF",
  card: "#FFFFFF",
  muted: "#7A7A7A",
  border: "#E8E2F8",
};

const GoldPayments = ({ route, navigation }) => {
  const { user } = route.params;

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
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const [filters, setFilters] = useState([
    { id: "date", title: "Date", value: formatDate(selectedDate), icon: "calendar" },
    { id: "customer", title: "Customer", value: "All", icon: "user" },
    { id: "group", title: "Group", value: "All", icon: "users" },
    { id: "paymentMode", title: "Payment Mode", value: "All", icon: "money" },
  ]);

  const paymentModes = ["cash", "online"];

  // Fetch data
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.userId) return;
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://13.51.87.99:3000/api/payment/get-payment?agentId=${user.userId}`
        );
        setCustomers(data || []);
      } catch (e) {
        console.error("Error fetching payments:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [user.userId]);

  useEffect(() => {
    const fetchCus = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://13.51.87.99:3000/api/user/get-user`);
        setCus(data || []);
      } catch (e) {
        console.error("Error fetching customers:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCus();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://13.51.87.99:3000/api/group/get-group`);
        setGroups(data || []);
      } catch (e) {
        Alert.alert("Network Error", "Failed to fetch groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/agent/get-agent-by-id/${user.userId}`);
        setAgent(data);
      } catch (e) {
        console.error("Error fetching agent:", e);
      }
    };
    fetchAgent();
  }, [user.userId]);

  // Filter logic
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter((c) => {
        const nameMatch = c?.user_id?.full_name
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const dateMatch = isSameDate(c.pay_date, selectedDate);
        const custMatch = !selectedCustomer || c?.user_id?._id === selectedCustomer;
        const grpMatch = !selectedGroup || c?.group_id?._id === selectedGroup;
        const payMatch = !selectedPaymentMode || c.pay_type === selectedPaymentMode;
        return nameMatch && dateMatch && custMatch && grpMatch && payMatch;
      })
    : [];

  const totalAmount = filteredCustomers.reduce(
    (sum, c) => sum + (parseFloat(c.amount) || 0),
    0
  );

  const handleFilterPress = (filterId) => {
    setSelectedFilter(filterId);
    setShowPicker(true);
  };

  const handleChitPress = (chitId) => setActiveChitId(chitId);

  const updateFilterValue = (id, value) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: value || "All" } : f))
    );
  };

  const renderPicker = () => {
    switch (selectedFilter) {
      case "group":
        return (
          <Picker
            selectedValue={selectedGroup}
            onValueChange={(v) => {
              const selected = groups.find((g) => g._id === v);
              setSelectedGroup(v);
              updateFilterValue("group", selected?.group_name);
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
            onValueChange={(v) => {
              const selected = cus.find((c) => c._id === v);
              setSelectedCustomer(v);
              updateFilterValue("customer", selected?.full_name);
              setShowPicker(false);
            }}
          >
            <Picker.Item label="All Customers" value="" />
            {cus.map((c) => (
              <Picker.Item
                key={c._id}
                label={`${c.full_name} - ${c.phone_number}`}
                value={c._id}
              />
            ))}
          </Picker>
        );
      case "paymentMode":
        return (
          <Picker
            selectedValue={selectedPaymentMode}
            onValueChange={(v) => {
              setSelectedPaymentMode(v);
              updateFilterValue("paymentMode", v);
              setShowPicker(false);
            }}
          >
            {paymentModes.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        );
      default:
        return null;
    }
  };

  const printPDF = async () => {
    const filteredForPrint = filteredCustomers
      .map(
        (c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${c?.group_id?.group_name || "N/A"}</td>
        <td>${c?.user_id?.full_name || "N/A"}</td>
        <td>${c?.user_id?.phone_number || "N/A"}</td>
        <td>${c.amount || "N/A"}</td>
        <td>${c.receipt_no || "N/A"}</td>
        <td>${c.pay_type || "N/A"}</td>
      </tr>`
      )
      .join("");
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; color: ${THEME.primary}; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f3f0fa; color: #333; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>Gold Payments</h1>
          <table>
            <tr>
              <th>Sl.No</th>
              <th>Group Name</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Receipt</th>
              <th>Payment Mode</th>
            </tr>
            ${filteredForPrint}
          </table>
          <div class="footer">
            <p>${agent.name || "Agent"} | ${selectedDate.toDateString()}</p>
            <p>Thank you!</p>
          </div>
        </body>
      </html>
    `;
    try {
      await RNPrint.print({ html });
    } catch (error) {
      Alert.alert("Print Error", "Unable to print document.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[THEME.primary, THEME.deep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBg}
      >
        <Header />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gold Payments</Text>
          <Text style={styles.headerSubtitle}>
            View, search & filter your gold payments
          </Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <View style={styles.container}>
          {/* Total & print */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>Total Collection</Text>
              <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.totalPrintBtn} onPress={printPDF}>
              <Icon name="print" size={16} color="#fff" />
              <Text style={styles.totalPrintText}>Print PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Icon name="search" size={16} color={THEME.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search gold payments..."
              placeholderTextColor={THEME.muted}
              style={styles.searchInput}
            />
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersRow}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {filters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterCard,
                  selectedFilter === f.id && styles.filterCardActive,
                ]}
                onPress={() => handleFilterPress(f.id)}
              >
                <Icon name={f.icon} size={16} color={THEME.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.filterTitle}>{f.title}</Text>
                  <Text numberOfLines={1} style={styles.filterValue}>
                    {f.value}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Picker (no overlay issue now) */}
          {showPicker && selectedFilter === "date" ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
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
              <TouchableOpacity
                style={styles.modalBg}
                activeOpacity={1}
                onPress={() => setShowPicker(false)}
              >
                <View style={styles.pickerCard}>{renderPicker()}</View>
              </TouchableOpacity>
            </Modal>
          )}

          {/* List */}
          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }}>
            {filteredCustomers.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Image source={noImage} style={styles.noImage} />
                <Text style={styles.noDataText}>No Payments Available!!!</Text>
              </View>
            ) : (
              filteredCustomers.map((c, i) => (
                <PaymentChitList
                  key={i}
                  idx={i}
                  name={c?.user_id?.full_name || "N/A"}
                  phone={c?.user_id?.phone_number || "N/A"}
                  receipt={c.receipt_no}
                  date={c.pay_date}
                  amount={c.amount}
                  group={c?.group_id?.group_name || "N/A"}
                  type={c.pay_type}
                  navigation={navigation}
                  user={user}
                  onPress={() => handleChitPress(c._id)}
                  customer={c}
                  isActive={c._id === activeChitId}
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
  headerBg: {
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerContent: { paddingHorizontal: 18, alignItems: "center", marginTop: 2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    textAlign: "center",
  },
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
  filtersRow: { marginBottom: 8, marginTop: 4 },
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
    minWidth: 110,
  },
  filterCardActive: { backgroundColor: THEME.lightTint },
  filterTitle: { fontSize: 12, color: "#444", fontWeight: "600" },
  filterValue: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerCard: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 12 },
   list: { marginTop: 8, paddingHorizontal: 8 },
  noDataContainer: { alignItems: "center", marginTop: 40 },
  noDataText: { color: THEME.muted, fontSize: 14, marginTop: 12 },
  noImage: { width: 220, height: 150, resizeMode: "contain" },
});
export default GoldPayments;
