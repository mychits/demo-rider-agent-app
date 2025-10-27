import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import moment from "moment";
import COLORS from "../constants/color";
import baseUrl from "../constants/baseUrl";
import goldBaseUrl from "../constants/goldBaseUrl";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
const noImage = require("../assets/no.png");

const ViewLeads = ({ route, navigation }) => {
  const { user } = route.params;

  const [chitLeads, setChitLeads] = useState([]);
  const [goldLeads, setGoldLeads] = useState([]);
  const [isChitLoading, setIsChitLoading] = useState(false);
  const [isGoldLoading, setIsGoldLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("CHIT");
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [filterText, setFilterText] = useState("Last Month");

  // Fetch Chit Leads
  const fetchChitLeads = async (startDate, endDate) => {
    setIsChitLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/lead/agent/${user.userId}/records`,
        { params: { start_date: startDate, end_date: endDate } }
      );
      setChitLeads(response.data);
    } catch (error) {
      console.error("Error fetching chit leads:", error);
      setChitLeads([]);
    } finally {
      setIsChitLoading(false);
    }
  };

  // Fetch Gold Leads
  const fetchGoldLeads = async (startDate, endDate) => {
    setIsGoldLoading(true);
    try {
      const response = await axios.get(
        `${goldBaseUrl}/lead/agent/${user.userId}/records`,
        { params: { start_date: startDate, end_date: endDate } }
      );
      setGoldLeads(response.data);
    } catch (error) {
      console.error("Error fetching gold leads:", error);
      setGoldLeads([]);
    } finally {
      setIsGoldLoading(false);
    }
  };

  // Refetch on mount or focus
  useEffect(() => {
    fetchChitLeads(startDate, endDate);
    fetchGoldLeads(startDate, endDate);
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      fetchChitLeads(startDate, endDate);
      fetchGoldLeads(startDate, endDate);
    }, [startDate, endDate])
  );

  // UI Helpers
  const handleCall = (phone) => Linking.openURL(`tel:${phone}`);
  const handleWhatsApp = (phone) =>
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  const toggleExpand = (id) =>
    setExpandedLeadId(expandedLeadId === id ? null : id);

  const isFreshLead = (createdAt) => moment(createdAt).isSame(moment(), "day");

  const isNewLead = (createdAt) => {
    const leadDate = moment(createdAt);
    const tenDaysAgo = moment().subtract(10, "days").startOf("day");
    return leadDate.isAfter(tenDaysAgo) && !isFreshLead(createdAt);
  };

  // Search
  const filteredLeads = (activeTab === "CHIT" ? chitLeads : goldLeads).filter(
    (item) => {
      const data = `${item.lead_name} ${item.lead_phone} ${
        item.group_name || ""
      }`.toUpperCase();
      return data.includes(searchQuery.toUpperCase());
    }
  );

  const renderLeadCard = ({ item }) => {
    const expanded = expandedLeadId === item._id;
    const fresh = isFreshLead(item.createdAt);
    const createdDate = moment(item.createdAt).format("DD-MM-YYYY");
    const createdTime = moment(item.createdAt).format("HH:mm");

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item._id)}
        style={[
          styles.card,
          fresh
            ? styles.freshLeadCard
            : isNewLead(item.createdAt)
            ? styles.newLeadCard
            : {},
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.name}>{item.lead_name}</Text>
            <Text style={styles.groupName}>
              {item.group_id?.group_name || "No Group"}
            </Text>
          </View>
          <Icon
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#666"
          />
        </View>

        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.phoneNumber}>Phone: {item.lead_phone}</Text>
            <Text style={styles.createdAt}>
              Created: {createdDate} at {createdTime}
            </Text>
            {item.lead_image && (
              <Image
                source={{ uri: item.lead_image }}
                style={styles.leadImage}
              />
            )}

            <View style={styles.contactButtons}>
              <TouchableOpacity
                onPress={() => handleCall(item.lead_phone)}
                style={styles.callButton}
              >
                <Icon name="call" size={18} color={COLORS.white} />
                <Text style={styles.buttonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleWhatsApp(item.lead_phone)}
                style={styles.whatsappButton}
              >
                <Icon name="logo-whatsapp" size={18} color={COLORS.white} />
                <Text style={styles.buttonText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const isLoading = activeTab === "CHIT" ? isChitLoading : isGoldLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Violet Gradient Header */}
      <LinearGradient
        colors={["#7b2ff7", "#9e5fff"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Leads</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <Icon name="search" size={20} color="#888" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search leads..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="filter" size={20} color="#fff" />
          </TouchableOpacity> */}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {["CHIT", "GOLD"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === "CHIT"
                  ? `Chit Leads (${chitLeads.length})`
                  : `Gold Leads (${goldLeads.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leads */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#7b2ff7" style={{ marginTop: 20 }} />
        ) : filteredLeads.length > 0 ? (
          <FlatList
            data={filteredLeads}
            keyExtractor={(item, i) => item._id || i.toString()}
            renderItem={renderLeadCard}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Image source={noImage} style={styles.noImage} />
            <Text style={styles.noDataText}>No leads found</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddLead", { user })}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ViewLeads;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  backButton: {
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    // alignItems:"center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 45,
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#7b2ff7",
    padding: 10,
    borderRadius: 25,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#e3d3ff",
  },
  tabText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4b0082",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#7b2ff7",
  },
  freshLeadCard: { borderLeftColor: "green" },
  newLeadCard: { borderLeftColor: "#ff9800" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#222" },
  groupName: { color: "#666", marginTop: 2 },
  expandedContent: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
  phoneNumber: { color: "#333" },
  createdAt: { fontSize: 12, color: "#888", marginTop: 4 },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  callButton: {
    backgroundColor: "#7b2ff7",
    flexDirection: "row",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 5 },
  noDataContainer: { alignItems: "center", marginTop: 50 },
  noDataText: { color: "#555", fontSize: 14, marginTop: 10 },
  noImage: { width: 200, height: 150, resizeMode: "contain" },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#7b2ff7",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
});
