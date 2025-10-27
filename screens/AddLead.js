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
    ActivityIndicator
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";

import COLORS from "../constants/color";
import Button from "../components/Button";
import chitBaseUrl from "../constants/baseUrl";
import goldBaseUrl from "../constants/goldBaseUrl";

const AddLead = ({ route, navigation }) => {
    const { user } = route.params;

    const [currentDate, setCurrentDate] = useState("");
    const [receipt, setReceipt] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const [customerInfo, setCustomerInfo] = useState({
        full_name: "",
        phone_number: "",
        profession: "",
    });

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedTicket, setSelectedTicket] = useState("chit");

    useEffect(() => {
        const fetchGroups = async () => {
            const currentUrl =
                selectedTicket === "chit" ? `${chitBaseUrl}` : `${goldBaseUrl}`;
            try {
                const response = await axios.get(`${currentUrl}/group/get-group`);
                if (response.data) {
                    setGroups(response.data || []);
                    setSelectedGroup("");
                } else {
                    setGroups([]);
                }
            } catch (error) {
                console.error("Error fetching groups:", error.message);
                setGroups([]);
            }
        };
        if (selectedTicket) fetchGroups();
    }, [selectedTicket]);

    useEffect(() => {
        const today = moment().format("DD-MM-YYYY");
        setCurrentDate(today);
    }, []);

    useEffect(() => {
        const fetchAgentData = async () => {
            try {
                const response = await axios.get(
                    `${chitBaseUrl}/agent/get-agent-by-id/${user.userId}`
                );
                setReceipt(response.data);
            } catch (error) {
                console.error("Error fetching agent data:", error);
            }
        };
        fetchAgentData();
    }, [user.userId]);

    const handleInputChange = (field, value) => {
        setCustomerInfo({ ...customerInfo, [field]: value });
    };

    const handleAddLead = async () => {
        setIsLoading(true);
        const baseUrl =
            selectedTicket === "chit" ? `${chitBaseUrl}` : `${goldBaseUrl}`;

        if (
            !customerInfo.full_name ||
            !customerInfo.phone_number ||
            !customerInfo.profession ||
            !selectedTicket ||
            !selectedGroup
        ) {
            Alert.alert("Required", "Please fill out all fields!");
            setIsLoading(false);
            return;
        }

        try {
            const data = {
                lead_name: customerInfo.full_name,
                lead_phone: customerInfo.phone_number,
                lead_profession: customerInfo.profession,
                group_id: selectedGroup,
                lead_type: "agent",
                scheme_type: selectedTicket,
                lead_agent: selectedTicket === "chit" ? user.userId : receipt.name,
                agent_number: receipt.phone_number,
            };

            const response = await axios.post(`${baseUrl}/lead/add-lead`, data);

            if (response.status === 201) {
                Alert.alert("Success", "Lead added successfully!");
                setCustomerInfo({
                    full_name: "",
                    phone_number: "",
                    profession: "",
                });
                setSelectedGroup("");
                setSelectedTicket("chit");
                navigation.navigate("ViewLeads", { user: user });
            } else {
                Alert.alert("Error", response.data?.message || "Error adding lead.");
            }
        } catch (error) {
            console.error("Error adding lead:", error);
            Alert.alert("Error", "Error adding lead. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={["#5E17EB", "#8A2BE2"]}
                style={styles.gradientOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={styles.innerContainer}>
                            {/* Custom Violet Header */}
                            <View style={styles.headerContainer}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.backButton}
                                >
                                    <Icon name="arrow-left" size={22} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Add Lead</Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("ViewLeads", { user })}
                                    style={styles.myLeadsButton}
                                >
                                    <Text style={styles.myLeadsButtonText}>My Leads</Text>
                                </TouchableOpacity>
                            </View>

                            {/* White form area */}
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>Customer Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter full name"
                                    value={customerInfo.full_name}
                                    onChangeText={(value) =>
                                        handleInputChange("full_name", value)
                                    }
                                />

                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    value={customerInfo.phone_number}
                                    onChangeText={(value) =>
                                        handleInputChange("phone_number", value)
                                    }
                                />

                                <Text style={styles.label}>Profession</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={customerInfo.profession}
                                        onValueChange={(value) =>
                                            handleInputChange("profession", value)
                                        }
                                    >
                                        <Picker.Item label="Select Profession" value="" />
                                        <Picker.Item label="Employed" value="Employed" />
                                        <Picker.Item
                                            label="Self-Employed"
                                            value="Self-Employed"
                                        />
                                    </Picker>
                                </View>

                                <Text style={styles.label}>Scheme Type</Text>
                                <View style={styles.tabContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.tab,
                                            selectedTicket === "chit" && styles.activeTab,
                                        ]}
                                        onPress={() => setSelectedTicket("chit")}
                                    >
                                        <Text
                                            style={[
                                                styles.tabText,
                                                selectedTicket === "chit" &&
                                                    styles.activeTabText,
                                            ]}
                                        >
                                            Chit
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.tab,
                                            selectedTicket === "gold" && styles.activeTab,
                                        ]}
                                        onPress={() => setSelectedTicket("gold")}
                                    >
                                        <Text
                                            style={[
                                                styles.tabText,
                                                selectedTicket === "gold" &&
                                                    styles.activeTabText,
                                            ]}
                                        >
                                            Gold
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>Select Group</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={selectedGroup}
                                        onValueChange={(value) =>
                                            setSelectedGroup(value)
                                        }
                                    >
                                        <Picker.Item label="Select Group" value="" />
                                        {groups.map((group) => (
                                            <Picker.Item
                                                key={group._id}
                                                label={group.group_name}
                                                value={group._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                <Button
                                    title={isLoading ? "Please wait..." : "Add Lead"}
                                    filled
                                    style={[
                                        styles.submitButton,
                                        { backgroundColor: isLoading ? "gray" : "#7A28CB" },
                                    ]}
                                    onPress={handleAddLead}
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
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    gradientOverlay: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "transparent",
        marginTop: 10,
    },
    backButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    myLeadsButton: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    myLeadsButtonText: {
        color: "#6C2DC7",
        fontWeight: "bold",
    },
    formContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        flex: 1,
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginTop: 10,
    },
    input: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 15,
        fontSize: 15,
        elevation: 1,
        marginTop: 5,
    },
    pickerContainer: {
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        marginVertical: 8,
        elevation: 1,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#f1f1f1",
        borderRadius: 12,
        marginVertical: 8,
        padding: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: "#7A28CB",
    },
    tabText: {
        color: "#666",
        fontWeight: "500",
        fontSize: 15,
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "bold",
    },
    submitButton: {
        marginTop: 20,
        marginBottom: 30,
    },
});

export default AddLead;
