import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../components/Header";

const COLORS = {
  primary: "#6C2DC7", // Main violet
  secondary: "#9D50BB", // Gradient accent
  darkViolet: "#3B1E7A",
  backgroundLight: "#F4EEFB",
  white: "#FFFFFF",
  textPrimary: "#2E1C5D",
  textSecondary: "#7F69C8",
  textSubtle: "#E0D6FF",
};

// Reusable Card Component
const CustomRouteCard = ({ name, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
    <View style={styles.cardContent}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Icon name={icon} style={styles.cardIcon} />
      </LinearGradient>

      <View style={styles.textContainer}>
        <Text style={styles.cardText}>{name}</Text>
        <Text style={styles.cardSubText}>View customer details</Text>
      </View>
    </View>

    <Icon name="angle-right" style={styles.arrowIcon} />
  </TouchableOpacity>
);

const Routes = ({ route, navigation }) => {
  const { user } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSpacer}>
            <Header />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Customer Portfolio Overview</Text>
            <Text style={styles.subtitle}>
              Analyze your customer categories and performance data
            </Text>
          </View>

          <View style={styles.cardListContainer}>
            <CustomRouteCard
              name="Chits Customers"
              icon="users"
              onPress={() =>
                navigation.navigate("RouteCustomerChit", {
                  user,
                  areaId: "chits",
                })
              }
            />
            <CustomRouteCard
              name="Gold Chits Customers"
              icon="diamond"
              onPress={() =>
                navigation.navigate("RouteCustomerGold", {
                  user,
                  areaId: "gold-chits",
                })
              }
            />
            <CustomRouteCard
              name="Loan Customers"
              icon="money"
              onPress={() =>
                navigation.navigate("RouteCustomerLoan", {
                  user,
                  areaId: "loan-customer",
                })
              }
            />
            <CustomRouteCard
              name="Pigme Customers"
              icon="credit-card"
              onPress={() =>
                navigation.navigate("RouteCustomerPigme", {
                  user,
                  areaId: "pigmy-customer",
                })
              }
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 22,
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  headerSpacer: {
    marginTop: Platform.OS === "android" ? 50 : 70,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSubtle,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    width: "90%",
  },
  cardListContainer: {
    marginTop: 25,
    gap: 18,
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: "92%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  cardIcon: {
    fontSize: 22,
    color: COLORS.white,
  },
  textContainer: {
    flexShrink: 1,
  },
  cardText: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.darkViolet,
  },
  cardSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
});

export default Routes;
