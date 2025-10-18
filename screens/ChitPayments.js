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
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import RNPrint from "react-native-print";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import COLORS from "../constants/color";
import Header from "../components/Header";
import baseUrl from "../constants/baseUrl";
import PaymentChitList from "../components/PaymentChitList";

const noImage = require("../assets/no.png");

const ChitPayments = ({ route, navigation }) => {
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

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const isSameDate = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const [filters, setFilters] = useState([
    { id: "date", title: "Date", value: formatDate(new Date()), icon: "calendar" },
    { id: "customer", title: "Customer", value: "All", icon: "user" },
    { id: "group", title: "Group", value: "All", icon: "users" },
    { id: "paymentMode", title: "Payment Mode", value: "All", icon: "money" },
    { id: "totalCollection", title: "Total", value: "...", icon: "inr" },
  ]);

  const paymentModes = ["cash", "online"];

  const handleFilterPress = (id) => {
    if (id === "totalCollection") return;
    setSelectedFilter(id);
    setShowPicker(true);
  };

  const updateFilterValue = (id, value) =>
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: value || "All" } : f))
    );

  const handleChitPress = (id) => setActiveChitId(id);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${baseUrl}/payment/get-payment-agent/${user.userId}`);
        if (res.data) setCustomers(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [user.userId]);

  useEffect(() => {
    axios
      .get(`${baseUrl}/user/get-user`)
      .then((res) => setCus(res.data))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    axios
      .get(`${baseUrl}/group/get-group`)
      .then((res) => Array.isArray(res.data) && setGroups(res.data))
      .catch(() => Alert.alert("Error", "Failed to fetch groups"));
  }, []);

  useEffect(() => {
    axios
      .get(`${baseUrl}/agent/get-agent-by-id/${user.userId}`)
      .then((res) => setAgent(res.data))
      .catch(console.error);
  }, [user.userId]);

  const filteredCustomers = customers.filter((c) => {
    const nameMatch = c?.user_id?.full_name?.toLowerCase().includes(search.toLowerCase());
    const dateMatch = isSameDate(c.pay_date, selectedDate);
    const customerMatch = !selectedCustomer || c?.user_id?._id === selectedCustomer;
    const groupMatch = !selectedGroup || c?.group_id?._id === selectedGroup;
    const modeMatch = !selectedPaymentMode || c.pay_type === selectedPaymentMode;
    return nameMatch && dateMatch && customerMatch && groupMatch && modeMatch;
  });

  const totalAmount = filteredCustomers.reduce(
    (sum, c) => sum + (parseFloat(c.amount) || 0),
    0
  );

  useEffect(() => {
    if (!loading)
      updateFilterValue("totalCollection", `₹ ${totalAmount.toFixed(2)}`);
  }, [totalAmount, loading]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f3f8" }}>
      <LinearGradient
        colors={["#6C2DC7", "#3B1E7A"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Header />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Chit Collection Sheet</Text>
          <Text style={styles.subtitle}>Record Secure and verified customer payments</Text>
          <Text style={styles.totalText}>₹ {totalAmount.toFixed(2)}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6C2DC7" />
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#777" style={{ marginRight: 10 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customer or receipt..."
              placeholderTextColor="#aaa"
              style={styles.searchInput}
            />
          </View>

          <View style={{ height: 85 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {filters.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterCard, selectedFilter === f.id && styles.activeFilter]}
                  onPress={() => handleFilterPress(f.id)}
                >
                  <LinearGradient
                    colors={
                      f.id === "totalCollection"
                        ? ["#FFD700", "#E6C200"]
                        : ["#5C2FC2", "#412070"]
                    }
                    style={styles.filterGradient}
                  >
                    <View style={styles.filterContent}>
                      <Icon
                        name={f.icon}
                        size={18}
                        color={f.id === "totalCollection" ? "#4B0082" : "#fff"}
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flexShrink: 1 }}>
                        <Text
                          style={[
                            styles.filterTitle,
                            f.id === "totalCollection" && { color: "#4B0082" },
                          ]}
                        >
                          {f.title}
                        </Text>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.filterValue,
                            f.id === "totalCollection" && { color: "#4B0082" },
                          ]}
                        >
                          {f.value}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.printBtn} onPress={() => RNPrint.print()}>
            <Icon name="print" size={16} color="#fff" />
            <Text style={styles.printText}>Print Report</Text>
          </TouchableOpacity>

          {/* ✅ Date Picker - NOT inside Modal (Fixes double overlay) */}
          {showPicker && selectedFilter === "date" && (
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
          )}

          {/* ✅ Modal only for other filters */}
          {showPicker && selectedFilter !== "date" && (
            <Modal
              visible={showPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalBox}>{renderPicker()}</View>
              </View>
            </Modal>
          )}

          <ScrollView
            style={{ marginHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 90 }}
          >
            {filteredCustomers.length === 0 ? (
              <View style={styles.noDataBox}>
                <Image source={noImage} style={styles.noImage} />
                <Text style={styles.noText}>No Payments Found</Text>
              </View>
            ) : (
              filteredCustomers.map((c, i) => (
                <PaymentChitList
                  key={i}
                  idx={i}
                  name={c?.user_id?.full_name || "N/A"}
                  cus_id={c._id}
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
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerGradient: { paddingBottom: 20 },
  headerContainer: { alignItems: "center", paddingVertical: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 14, color: "#D9C8F0", marginTop: 4 },
  totalText: { fontSize: 24, fontWeight: "bold", color: "#FFD700", marginTop: 6 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 8 },
  filterScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterCard: {
    marginRight: 10,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },
  activeFilter: { transform: [{ scale: 1.04 }] },
  filterGradient: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  filterContent: { flexDirection: "row", alignItems: "center" },
  filterTitle: { fontSize: 13, color: "#E5D9FA", fontWeight: "bold" },
  filterValue: { fontSize: 12, color: "#D6C6F8" },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C2DC7",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    elevation: 3,
  },
  printText: { color: "#fff", fontWeight: "600", fontSize: 15, marginLeft: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  noDataBox: { alignItems: "center", marginTop: 50 },
  noImage: { width: 200, height: 130, resizeMode: "contain" },
  noText: { fontSize: 15, color: "#777", marginTop: 10 },
});

export default ChitPayments;
