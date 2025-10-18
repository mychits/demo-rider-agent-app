import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../components/Header";

const COLOR_PALETTE = {
  primary: "#7F00FF", // violet
  secondary: "#E100FF", // purple-pink
  white: "#FFFFFF",
  textDark: "#1A1A1A",
  textLight: "#666666",
  accent: "#9C27B0", // deeper violet accent for borders/icons
};

const PaymentCard = ({ name, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <View style={styles.cardContent}>
      <Icon name={icon} style={styles.cardIcon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{name}</Text>
        <Text style={styles.cardSubText}>View Payment History</Text>
      </View>
    </View>
    <Icon name="arrow-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const PaymentList = ({ route, navigation }) => {
  const { user } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PALETTE.white }}>
      <LinearGradient
        colors={[COLOR_PALETTE.primary, COLOR_PALETTE.secondary]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
        >
          <Header />

          {/* Page Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Payment HandBook 🧾</Text>
            <Text style={styles.subtitle}>Select a payment type to continue</Text>
          </View>

          {/* Payment Options */}
          <View style={styles.cardListContainer}>
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
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 10,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLOR_PALETTE.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#F5F5F5",
    marginTop: 5,
  },
  cardListContainer: {
    marginTop: 15,
    gap: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: COLOR_PALETTE.white,
    borderRadius: 15,
    padding: 18,
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: COLOR_PALETTE.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 15,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLOR_PALETTE.textDark,
  },
  cardSubText: {
    fontSize: 13,
    color: COLOR_PALETTE.textLight,
    marginTop: 2,
  },
  cardIcon: {
    fontSize: 32,
    color: COLOR_PALETTE.accent,
  },
  arrowIcon: {
    fontSize: 20,
    color: COLOR_PALETTE.accent,
  },
});

export default PaymentList;
