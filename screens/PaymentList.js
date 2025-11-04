import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";

const COLOR_PALETTE = {
  primary: "#7C3AED", // violet
  secondary: "#9B5DE5", // purple-pink
  accent: "#A78BFA", // lighter violet
  white: "#FFFFFF",
  textDark: "#1A1A1A",
  textLight: "#6B6B6B",
};

const PaymentCard = ({ name, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
    <View style={styles.cardLeft}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={22} color={COLOR_PALETTE.white} />
      </View>
      <View>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardSubtitle}>View Payment History</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLOR_PALETTE.primary} />
  </TouchableOpacity>
);

const PaymentList = ({ route, navigation }) => {
  const { user } = route?.params || {};

  return (
    <View style={{ flex: 1, backgroundColor: COLOR_PALETTE.white }}>
      {/* Fullscreen violet background including status bar */}
      <LinearGradient
        colors={[COLOR_PALETTE.primary, COLOR_PALETTE.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topGradient}
      >
        {/* Translucent violet status bar */}
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* Header */}
        <SafeAreaView>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Payment Handbook 🧾</Text>
              <Text style={styles.headerSubtitle}>
                Select a payment type to continue
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* White rounded section below header */}
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <PaymentCard
            name="Chits Payments Book"
            icon="money"
            onPress={() =>
              navigation.navigate("ChitPayment", { user, areaId: "chits" })
            }
          />
          <PaymentCard
            name="Gold Chits Payments Book"
            icon="credit-card"
            onPress={() =>
              navigation.navigate("GoldPayment", { user, areaId: "gold-chits" })
            }
          />
          <PaymentCard
            name="Loan Payments Book"
            icon="bank"
            onPress={() =>
              navigation.navigate("LoanPayments", { user, areaId: "loans" })
            }
          />
          <PaymentCard
            name="Pigme Payments Book"
            icon="briefcase"
            onPress={() =>
              navigation.navigate("PigmePayments", { user, areaId: "pigmy" })
            }
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default PaymentList;

const styles = StyleSheet.create({
  // Full violet gradient area including notch and time
  topGradient: {
    height: Platform.OS === "ios" ? 230 : 250,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 10,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerContainer: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 20: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  headerTextContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLOR_PALETTE.white,
    textAlign: "center",
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#EDE9FE",
    marginTop: 6,
    textAlign: "center",
  },
  // White content area
  contentContainer: {
    flex: 1,
    backgroundColor: COLOR_PALETTE.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -30,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#7c3aed",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: COLOR_PALETTE.primary,
    borderRadius: 12,
    padding: 10,
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLOR_PALETTE.textDark,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLOR_PALETTE.textLight,
    marginTop: 2,
  },
});
