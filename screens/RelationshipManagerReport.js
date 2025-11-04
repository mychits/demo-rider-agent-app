import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import baseUrl from "../constants/baseUrl";
import COLORS from "../constants/color";

// --- Assets ---
const NO_REPORTS_IMAGE = require("../assets/NoReports.png");

// --- VIOLET THEME COLORS ---
const VIOLET_DARK = "#6D28D9";
const VIOLET_MEDIUM = "#8B5CF6";
const ACCENT_GREEN = "#10b981";
const WARNING_RED = "#ef4444";
const TEXT_DARK = "#1f2937";
const GREY_TEXT = "#6b7280";

// Enable layout animation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "₹0.00";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "₹0.00";
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const RelationshipManagerReport = ({ route }) => {
  const navigation = useNavigation();
  const { user } = route.params || {};

  const [groups, setGroups] = useState([]);
  const [dues, setDues] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupRes, dueRes] = await Promise.all([
          fetch(`${baseUrl}/group/get-group`),
          fetch(`${baseUrl}/enroll/due/relationship-manager/${user?.userId}`),
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

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilteredData(allDues);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId) fetchData();
  }, [user?.userId]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedGroup === "all") setFilteredData(dues);
    else setFilteredData(dues.filter((i) => i.group_id?._id === selectedGroup));
  }, [selectedGroup, dues]);

  const renderItem = ({ item }) => {
    const name = item?.user_id?.full_name || "Unknown";
    const groupName = item?.group_id?.group_name || "N/A";
    const paymentType = item?.payment_type || "N/A";
    const balance = item?.balance || 0;
    const totalPayable = item?.total_payable_amount?.[0] || 0;
    const totalProfit = item?.total_profit?.[0] || 0;
    const totalToBePaid = item?.total_to_be_paid || 0;
    const statusColor = balance > 0 ? WARNING_RED : ACCENT_GREEN;

    return (
      <View style={styles.cardContainer}>
        <View
          style={[styles.cardStatusIndicator, { backgroundColor: statusColor }]}
        />
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.paymentType}>{paymentType}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.customerName}>{name}</Text>
          </View>

          <View style={styles.cardFinancial}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Payable</Text>
              <Text style={[styles.financialValue, { color: ACCENT_GREEN }]}>
                {formatCurrency(totalPayable)}
              </Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Profit</Text>
              <Text style={[styles.financialValue, { color: ACCENT_GREEN }]}>
                {formatCurrency(totalProfit)}
              </Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total To Be Paid</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(totalToBePaid)}
              </Text>
            </View>

            <View
              style={[
                styles.balanceRow,
                {
                  backgroundColor: balance > 0 ? "#FEE2E2" : "#D1FAE5",
                  borderColor: balance > 0 ? WARNING_RED : ACCENT_GREEN,
                },
              ]}
            >
              <Text
                style={[
                  styles.balanceLabel,
                  { color: balance > 0 ? WARNING_RED : ACCENT_GREEN },
                ]}
              >
                Balance
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  { color: balance > 0 ? WARNING_RED : ACCENT_GREEN },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const totalPending = filteredData.reduce(
    (sum, i) => sum + (i?.balance || 0),
    0
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image source={NO_REPORTS_IMAGE} style={styles.emptyImage} />
      <Text style={styles.emptyText}>No pending dues found!!</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={VIOLET_DARK} />
      <LinearGradient
        colors={[VIOLET_DARK, VIOLET_MEDIUM]}
        style={{ flex: 1 }}
      >
        {/* HEADER with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relationship Report</Text>
        </View>

        <View style={styles.container}>
          {/* FILTER */}
          <View style={styles.dropdownWrapper}>
            <Text style={styles.dropdownLabel}>Filter by Group</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedGroup}
                onValueChange={(v) => setSelectedGroup(v)}
                style={[styles.picker, { color: VIOLET_DARK }]}
              >
                <Picker.Item label="All Groups" value="all" />
                {groups.map((g) => (
                  <Picker.Item key={g._id} label={g.group_name} value={g._id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* TOTAL SUMMARY */}
          <View style={styles.totalWrapper}>
            <Text style={styles.totalText}>Total Outstanding Balance:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(totalPending)}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={VIOLET_DARK} />
              <Text style={{ marginTop: 10, color: GREY_TEXT }}>
                Loading data...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item, index) =>
                item?._id?.toString() || index.toString()
              }
              ListEmptyComponent={EmptyList}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default RelationshipManagerReport;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dropdownWrapper: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
  },
  dropdownLabel: {
    fontWeight: "700",
    marginBottom: 8,
    color: VIOLET_DARK,
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  totalWrapper: {
    backgroundColor: "#ede9fe",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: VIOLET_MEDIUM,
    alignItems: "center",
  },
  totalText: {
    color: VIOLET_DARK,
    fontWeight: "600",
    fontSize: 14,
  },
  totalAmount: {
    color: VIOLET_DARK,
    fontWeight: "900",
    fontSize: 24,
  },
  cardContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  cardStatusIndicator: {
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    padding: 20,
    elevation: 6,
    marginLeft: -6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
  },
  groupName: {
    fontSize: 17,
    fontWeight: "800",
    color: VIOLET_DARK,
  },
  paymentType: {
    fontSize: 13,
    color: VIOLET_MEDIUM,
    fontWeight: "600",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  financialLabel: {
    fontSize: 15,
    color: TEXT_DARK,
    fontWeight: "600",
  },
  financialValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  loader: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyImage: {
    width: 200,
    height: 160,
    opacity: 0.8,
  },
  emptyText: {
    color: "#fff",
    marginTop: 20,
    fontWeight: "700",
    fontSize: 18,
  },
});
