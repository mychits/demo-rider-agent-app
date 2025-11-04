import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import baseUrl from "../constants/baseUrl";

// --- API URLs ---
const DUE_API = `${baseUrl}/enroll/due/routes/agent/`;
const GROUP_API = `${baseUrl}/group/get-group`;
const NO_REPORTS_IMAGE = require("../assets/NoReports.png");

// --- VIOLET THEME COLORS ---
const VIOLET_MAIN = "#7c3aed";
const VIOLET_LIGHT = "#a78bfa";
const VIOLET_DARK = "#6b21a8";
const WHITE = "#ffffff";
const GREY_TEXT = "#6b7280";
const GREEN = "#16a34a";
const RED = "#dc2626";
const BORDER = "#e5e7eb";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Currency Formatter ---
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "₹0.00";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "₹0.00";
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// --- CALL HANDLER ---
const handleCall = (phoneNumber) => {
  if (phoneNumber) {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) return Linking.openURL(url);
        else console.log("Cannot open:", url);
      })
      .catch((err) => console.error("Dialer error:", err));
  }
};

// =================================================================
// CARD COMPONENT
// =================================================================
const OutstandingReportCard = ({ item, activeCallId, setActiveCallId }) => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const name = item?.user_id?.full_name || "Unknown";
  const phone = item?.user_id?.phone_number;
  const groupName = item?.group_id?.group_name || "N/A";
  const paymentType = item?.payment_type || "N/A";
  const isCalling = activeCallId === item?._id;

  const balance = item?.balance || item?.Balance || 0;
  const totalPayable = item?.total_payable_amount || 0;
  const totalToBePaid = item?.total_to_be_paid || 0;
  const balanceColor = balance > 0 ? RED : GREEN;

  const toggleDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDetailsVisible(!isDetailsVisible);
  };

  const handlePhonePress = () => {
    if (!phone) return;
    setActiveCallId(item?._id);
    handleCall(phone);
    setTimeout(() => setActiveCallId(null), 3000);
  };

  return (
    <View style={cardStyles.cardContainer}>
      <View style={cardStyles.cardContent}>
        {/* Header */}
        <View style={cardStyles.cardHeader}>
          <Text style={cardStyles.groupName} numberOfLines={1}>{groupName}</Text>
          <View style={cardStyles.paymentTypeTag}>
            <Text style={cardStyles.paymentTypeText}>{paymentType}</Text>
          </View>
        </View>

        {/* Customer Row */}
        <View style={cardStyles.customerInfoRow}>
          <Text style={cardStyles.customerName}>{name}</Text>
          {phone && (
            <TouchableOpacity
              onPress={handlePhonePress}
              style={[
                cardStyles.callButton,
                { backgroundColor: isCalling ? VIOLET_DARK : GREEN },
              ]}
              disabled={isCalling}
            >
              <Ionicons name="call" size={16} color={WHITE} />
              <Text style={cardStyles.callButtonText}>
                {isCalling ? "Calling..." : "Call"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Balance */}
        <View style={cardStyles.balanceRow}>
          <Text style={cardStyles.balanceLabel}>Outstanding Balance:</Text>
          <Text style={[cardStyles.balanceValue, { color: balanceColor }]}>
            {formatCurrency(balance)}
          </Text>
        </View>

        {/* Toggle */}
        <TouchableOpacity onPress={toggleDetails} style={cardStyles.detailsToggle}>
          <Text style={cardStyles.detailsToggleText}>
            {isDetailsVisible ? "Hide Details ▲" : "Show Details ▼"}
          </Text>
        </TouchableOpacity>

        {/* Details */}
        {isDetailsVisible && (
          <View style={cardStyles.detailsSection}>
            <View style={cardStyles.financialRow}>
              <Text style={cardStyles.financialLabel}>Total To Be Paid</Text>
              <Text style={cardStyles.financialValue}>
                {formatCurrency(totalToBePaid)}
              </Text>
            </View>
            <View style={cardStyles.financialRow}>
              <Text style={cardStyles.financialLabel}>Total Payable</Text>
              <Text style={[cardStyles.financialValue, { color: GREEN }]}>
                {formatCurrency(totalPayable)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================
const OutstandingReports = ({ route }) => {
  const { user } = route.params;
  const navigation = useNavigation();

  const [groups, setGroups] = useState([]);
  const [dues, setDues] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeCallId, setActiveCallId] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupRes, dueRes] = await Promise.all([
          fetch(GROUP_API),
          fetch(`${DUE_API}${user?.userId}`),
        ]);
        const groupJson = await groupRes.json();
        const dueJson = await dueRes.json();
        const allGroups = Array.isArray(groupJson?.data)
          ? groupJson.data
          : Array.isArray(groupJson)
          ? groupJson
          : [];
        const allDues = dueJson?.enrollments || [];
        setGroups(allGroups);
        setDues(allDues);
        setFilteredData(allDues);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.userId]);

  // Filter by Group
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedGroup === "all") setFilteredData(dues);
    else
      setFilteredData(
        dues.filter((item) => item.group_id?._id === selectedGroup)
      );
  }, [selectedGroup, dues]);

  const totalPending = filteredData.reduce(
    (sum, item) => sum + (item?.balance || 0),
    0
  );

  const EmptyList = () => (
    <View style={pageStyles.emptyContainer}>
      <Image source={NO_REPORTS_IMAGE} style={pageStyles.emptyImage} />
      <Text style={pageStyles.emptyText}>No pending dues found</Text>
    </View>
  );

  return (
    <LinearGradient colors={[VIOLET_MAIN, VIOLET_LIGHT]} style={{ flex: 1 }}>
      {/* Header with Back Button */}
      <View style={pageStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={pageStyles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={WHITE} />
        </TouchableOpacity>
        <Text style={pageStyles.headerTitle}>Outstanding Report</Text>
        <Text style={pageStyles.headerSubtitle}>
          Track and manage all pending payments
        </Text>
      </View>

      {/* White Section */}
      <View style={pageStyles.whiteSection}>
        {/* Group Filter */}
        <View style={pageStyles.dropdownWrapper}>
          <Text style={pageStyles.dropdownLabel}>Filter by Group</Text>
          <View style={pageStyles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroup}
              onValueChange={(val) => setSelectedGroup(val)}
              style={pageStyles.picker}
            >
              <Picker.Item label="All Groups" value="all" />
              {groups.map((g) => (
                <Picker.Item key={g._id} label={g.group_name} value={g._id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Total Summary */}
        <View style={pageStyles.totalWrapper}>
          <Text style={pageStyles.totalText}>Overall Outstanding Balance:</Text>
          <Text style={pageStyles.totalAmount}>
            {formatCurrency(totalPending)}
          </Text>
        </View>

        {/* List */}
        {loading ? (
          <View style={pageStyles.loader}>
            <ActivityIndicator size="large" color={VIOLET_MAIN} />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={({ item }) => (
              <OutstandingReportCard
                item={item}
                activeCallId={activeCallId}
                setActiveCallId={setActiveCallId}
              />
            )}
            keyExtractor={(item, i) => item?._id?.toString() || i.toString()}
            ListEmptyComponent={EmptyList}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </LinearGradient>
  );
};

export default OutstandingReports;

const pageStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: 70,
    paddingBottom: 25,
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 30,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 26,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#ede9fe",
    fontSize: 14,
    marginTop: 5,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -10,
  },
  dropdownWrapper: {
    backgroundColor: "#fafafa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  dropdownLabel: {
    fontWeight: "700",
    marginBottom: 8,
    color: VIOLET_DARK,
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: WHITE,
  },
  picker: { color: VIOLET_MAIN },
  totalWrapper: {
    backgroundColor: "#f5f3ff",
    borderLeftWidth: 6,
    borderLeftColor: VIOLET_MAIN,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    alignItems: "center",
  },
  totalText: { color: VIOLET_DARK, fontWeight: "700", fontSize: 17 },
  totalAmount: { color: VIOLET_MAIN, fontWeight: "900", fontSize: 26 },
  loader: { alignItems: "center", justifyContent: "center", marginTop: 50 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyImage: { width: 200, height: 160, opacity: 0.8 },
  emptyText: { color: GREY_TEXT, marginTop: 20, fontWeight: "700", fontSize: 18 },
});

const cardStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: WHITE,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: { padding: 18 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 8,
  },
  groupName: { fontSize: 16, fontWeight: "800", color: VIOLET_DARK },
  paymentTypeTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentTypeText: {
    fontSize: 12,
    color: VIOLET_MAIN,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  customerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e1e2f",
    flexShrink: 1,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: WHITE,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 5,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#faf5ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ede9fe",
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  balanceLabel: { fontSize: 13, fontWeight: "700", color: "#1e1e2f" },
  balanceValue: { fontSize: 20, fontWeight: "900" },
  detailsToggle: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 10,
  },
  detailsToggleText: { color: VIOLET_MAIN, fontWeight: "700", fontSize: 14 },
  detailsSection: { paddingTop: 10 },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  financialLabel: { fontSize: 15, color: GREY_TEXT, fontWeight: "500" },
  financialValue: { fontSize: 16, color: "#1e1e2f", fontWeight: "700" },
});
