import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Linking,
	Alert,
	Image,
	TextInput,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import baseUrl from "../constants/baseUrl";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";

const noImage = require("../assets/no.png");

const COLOR_PALETTE = {
	primary: "#6C2DC7", // Violet
	secondary: "#3B1E7A", // Dark Violet
	white: "#FFFFFF",
	textDark: "#2C2C2C",
	textLight: "#777777",
	accent: "#8B5CF6",
};

const whatsappMessage = "Hello from our app!";

const sendWhatsappMessage = (item) => {
	if (item?.phone_number) {
		let url = `whatsapp://send?phone=${item.phone_number}&text=${encodeURIComponent(
			whatsappMessage
		)}`;
		Linking.canOpenURL(url)
			.then((supported) => {
				if (supported) {
					return Linking.openURL(url);
				} else {
					Alert.alert("WhatsApp is not installed");
				}
			})
			.catch(() => Alert.alert("Something went wrong!"));
	}
};

const openDialer = (item) => {
	if (item.phone_number) {
		Linking.canOpenURL(`tel:${item.phone_number}`)
			.then((supported) => {
				if (supported) {
					Linking.openURL(`tel:${item.phone_number}`);
				}
			})
			.catch(() => Alert.alert("Something went wrong!"));
	}
};

const ViewCustomer = ({ route, navigation }) => {
	const { user } = route.params;

	const [chitCustomers, setChitCustomers] = useState([]);
	const [goldCustomers, setGoldCustomers] = useState([]);
	const [isChitLoading, setIsChitLoading] = useState(false);
	const [isGoldLoading, setIsGoldLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("CHIT");
	const [search, setSearch] = useState("");

	useEffect(() => {
		fetchCustomers();
	}, [activeTab, user]);

	useFocusEffect(
		useCallback(() => {
			fetchCustomers();
		}, [activeTab, user])
	);

	const fetchCustomers = async () => {
		const currentUrl =
			activeTab === "CHIT" ? `${baseUrl}` : "http://13.60.68.201:3000/api";
		try {
			if (activeTab === "CHIT") setIsChitLoading(true);
			else setIsGoldLoading(true);

			const response = await axios.get(
				`${currentUrl}/user/get-users-by-agent-id/${user.userId}`
			);

			if (activeTab === "CHIT") setChitCustomers(response.data);
			else setGoldCustomers(response.data);
		} catch (err) {
			console.log(err);
			if (activeTab === "CHIT") setChitCustomers([]);
			else setGoldCustomers([]);
		} finally {
			if (activeTab === "CHIT") setIsChitLoading(false);
			else setIsGoldLoading(false);
		}
	};

	const renderCustomerCard = ({ item }) => (
		<View style={styles.card}>
			<View style={styles.leftSection}>
				<Text style={styles.name}>{item.full_name}</Text>
				<Text style={styles.phoneNumber}>{item.phone_number}</Text>
				<Text style={styles.schemeType}>
					{item.scheme_type
						? item.scheme_type.charAt(0).toUpperCase() +
						  item.scheme_type.slice(1)
						: ""}
				</Text>
			</View>
			<View style={styles.rightSection}>
				<TouchableOpacity onPress={() => sendWhatsappMessage(item)}>
					<Icon
						name="whatsapp"
						size={24}
						color="#25D366"
						style={{ marginBottom: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => openDialer(item)}>
					<Icon name="phone" size={24} color={COLOR_PALETTE.primary} />
				</TouchableOpacity>
			</View>
		</View>
	);

	const customers = activeTab === "CHIT" ? chitCustomers : goldCustomers;
	const isLoading = activeTab === "CHIT" ? isChitLoading : isGoldLoading;

	const filteredCustomers = customers.filter((customer) =>
		customer.full_name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PALETTE.white }}>
			{/* Rounded Violet Header */}
			<LinearGradient
				colors={[COLOR_PALETTE.primary, COLOR_PALETTE.secondary]}
				style={styles.headerContainer}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				{/* Back Button */}
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}
				>
					<Icon name="arrow-left" size={20} color={COLOR_PALETTE.white} />
				</TouchableOpacity>

				{/* Header Title */}
				<View style={styles.titleContainer}>
					<Text style={styles.title}>Customers</Text>
					<Text style={styles.totalCountText}>
						{filteredCustomers.length || 0}
					</Text>
				</View>

				{/* Search Box */}
				<View style={styles.searchContainer}>
					<Icon name="search" size={20} color="#666" style={styles.searchIcon} />
					<TextInput
						style={styles.searchInput}
						placeholder="Search..."
						value={search}
						onChangeText={setSearch}
					/>
				</View>
			</LinearGradient>

			{/* White Content Section */}
			<View style={styles.bodyContainer}>
				{/* Tabs */}
				<View style={styles.tabContainer}>
					<TouchableOpacity
						style={[styles.tab, activeTab === "CHIT" && styles.activeTab]}
						onPress={() => setActiveTab("CHIT")}
					>
						<Text
							style={[
								styles.tabText,
								activeTab === "CHIT" && styles.activeTabText,
							]}
						>
							Chit Customers
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.tab, activeTab === "GOLD" && styles.activeTab]}
						onPress={() => setActiveTab("GOLD")}
					>
						<Text
							style={[
								styles.tabText,
								activeTab === "GOLD" && styles.activeTabText,
							]}
						>
							Gold Customers
						</Text>
					</TouchableOpacity>
				</View>

				{/* Customer List */}
				{isLoading ? (
					<ActivityIndicator
						size="large"
						color={COLOR_PALETTE.primary}
						style={{ marginTop: 20 }}
					/>
				) : filteredCustomers.length > 0 ? (
					<FlatList
						data={filteredCustomers}
						keyExtractor={(item, index) => index.toString()}
						renderItem={renderCustomerCard}
						contentContainerStyle={{ paddingBottom: 100 }}
					/>
				) : (
					<View style={styles.noDataContainer}>
						<Image source={noImage} style={styles.noImage} />
						<Text style={styles.noDataText}>No customers found</Text>
					</View>
				)}
			</View>

			{/* Add Button */}
			<TouchableOpacity
				onPress={() => navigation.navigate("AddCustomer", { user: user })}
				style={styles.addButton}
			>
				<Text style={styles.addText}>+ Add</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
		borderBottomLeftRadius: 40,
		borderBottomRightRadius: 40,
		elevation: 5,
	},
	backButton: {
		alignSelf: "flex-start",
		marginBottom: 10,
	},
	titleContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: { fontSize: 26, fontWeight: "bold", color: COLOR_PALETTE.white },
	totalCountText: { fontSize: 26, fontWeight: "bold", color: COLOR_PALETTE.white },
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLOR_PALETTE.white,
		borderRadius: 15,
		paddingHorizontal: 15,
		marginTop: 15,
	},
	searchIcon: { marginRight: 10 },
	searchInput: { flex: 1, height: 45 },
	bodyContainer: {
		flex: 1,
		backgroundColor: COLOR_PALETTE.white,
		padding: 15,
		marginTop: -20,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "rgba(240,240,240,0.9)",
		borderRadius: 15,
		marginBottom: 10,
		padding: 5,
	},
	tab: {
		flex: 1,
		paddingVertical: 10,
		alignItems: "center",
		borderRadius: 12,
	},
	activeTab: { backgroundColor: COLOR_PALETTE.accent },
	tabText: { fontSize: 16, color: "#444", fontWeight: "500" },
	activeTabText: { color: COLOR_PALETTE.white, fontWeight: "bold" },
	card: {
		backgroundColor: "#F8F8F8",
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 15,
		marginVertical: 5,
		borderRadius: 15,
		alignItems: "center",
		elevation: 2,
	},
	leftSection: { flex: 1 },
	rightSection: { flexDirection: "row", gap: 15 },
	name: { fontSize: 18, fontWeight: "600", color: COLOR_PALETTE.textDark },
	phoneNumber: { fontSize: 14, color: COLOR_PALETTE.textLight },
	schemeType: {
		fontSize: 14,
		color: COLOR_PALETTE.primary,
		fontWeight: "500",
		marginTop: 5,
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 50,
	},
	noDataText: { fontSize: 14, color: COLOR_PALETTE.textLight, textAlign: "center" },
	noImage: { width: 200, height: 120, resizeMode: "contain", marginBottom: 20 },
	addButton: {
		position: "absolute",
		bottom: 80,
		right: 20,
		backgroundColor: "#f07408",
		borderRadius: 30,
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		elevation: 6,
	},
	addText: { color: COLOR_PALETTE.white, fontSize: 12, fontWeight: "bold" },
});

export default ViewCustomer;
