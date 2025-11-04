// fileName: Profile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import baseUrl from "../constants/baseUrl";

const Profile = ({ route, navigation }) => {
  const { user } = route.params;
  const [agent, setAgent] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // ===== Fetch Agent Info =====
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/agent/get-agent-by-id/${user.userId}`
        );
        if (response.data) {
          setAgent(response.data);
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };

    fetchAgent();
  }, []);

  // ===== Load Stored Profile Image =====
  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedUri = await AsyncStorage.getItem(
          `profile_image_${user.userId}`
        );
        if (storedUri) setProfileImage(storedUri);
      } catch (err) {
        console.log("Error loading profile image:", err);
      }
    };
    loadImage();
  }, []);

  // ===== Pick and Save Image =====
  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your gallery."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem(`profile_image_${user.userId}`, uri);
      }
    } catch (err) {
      console.log("Error picking image:", err);
    }
  };

  // ===== Logout =====
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate("Login", { user });
    } catch (err) {
      console.log("Failed to clear user data");
    }
  };

  // ===== Menu Options =====
  const menuItems = [
    {
      name: "Language",
      icon: "globe-outline",
      component: Ionicons,
      value: "English",
      action: () => {},
    },
    {
      name: "Collections",
      icon: "briefcase",
      component: MaterialCommunityIcons,
      action: () => navigation.navigate("PaymentNavigator"),
    },
    {
      name: "Payments",
      icon: "credit-card-outline",
      component: MaterialCommunityIcons,
      action: () => navigation.navigate("PayNavigation", { user }),
    },
    {
      name: "Leads",
      icon: "account-plus",
      component: MaterialCommunityIcons,
      action: () =>
        navigation.navigate("PayNavigation", {
          screen: "ViewLeads",
          params: { user },
        }),
    },
    {
      name: "Commissions",
      icon: "cash-multiple",
      component: MaterialCommunityIcons,
      action: () => navigation.navigate("Commissions"),
    },
    {
      name: "About MyChits",
      icon: "information-circle-outline",
      component: Ionicons,
      action: () => navigation.navigate("AboutMyChits"),
    },
    {
      name: "Help & Support",
      icon: "help-circle-outline",
      component: Ionicons,
      action: () => navigation.navigate("HelpAndSupport"),
    },
  ];

  // ===== UI =====
  return (
    <View style={{ flex: 1, backgroundColor: "#f7f5ff" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={["#7c3aed", "#9b5de5"]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Profile Info */}
        <TouchableOpacity onPress={pickImage} style={styles.profileHeader}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../assets/P.png")
            }
            style={styles.profileAvatar}
          />
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.agentName}>{agent.name || "Agent Name"}</Text>
        <Text style={styles.agentPhone}>
          {agent.phone_number || "Phone Number"}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.sectionBody}>
            {menuItems.map((item, index) => {
              const IconComponent = item.component;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={item.action}
                  activeOpacity={0.8}
                  style={styles.menuCard}
                >
                  <View style={styles.rowIcon}>
                    <IconComponent color="#fff" name={item.icon} size={20} />
                  </View>
                  <Text style={styles.rowLabel}>{item.name}</Text>
                  <View style={styles.rowSpacer} />
                  {item.value && (
                    <Text style={styles.rowValue}>{item.value}</Text>
                  )}
                  <MaterialCommunityIcons
                    color="#C6C6C6"
                    name="chevron-right"
                    size={20}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.9}
            style={styles.logoutContainer}
          >
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  gradientHeader: {
    height: 280,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 8,
    borderRadius: 10,
  },
  profileHeader: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#fff",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#7c3aed",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  agentName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "800",
    marginTop: 10,
  },
  agentPhone: {
    fontSize: 15,
    color: "#e9e0ff",
    marginTop: 2,
  },
  sectionBody: {
    marginTop: 20,
    paddingHorizontal: 18,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  rowSpacer: {
    flexGrow: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B8B8B",
    marginRight: 8,
  },
  logoutContainer: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  logoutButton: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
