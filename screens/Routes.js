import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated, // <-- Import Animated
  Easing,   // <-- Import Easing for smooth transitions
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
// Assuming Header component is in '../components/Header'
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

// --- Dynamic Data for Routes ---
const ROUTE_OPTIONS = [
  { name: "Chits Customers", icon: "users", screen: "RouteCustomerChit", areaId: "chits" },
  { name: "Gold Chits Customers", icon: "diamond", screen: "RouteCustomerGold", areaId: "gold-chits" },
  { name: "Loan Customers", icon: "money", screen: "RouteCustomerLoan", areaId: "loan-customer" },
  { name: "Pigmy Customers", icon: "credit-card", screen: "RouteCustomerPigme", areaId: "pigmy-customer" },
];

// --- Animated CustomRouteCard Component ---
const AnimatedRouteCard = ({ name, icon, onPress, index }) => {
  // Animated value for each card's opacity and vertical position
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Staggered animation for card visibility
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade to full opacity
        duration: 500,
        delay: index * 120 + 300, // Staggered delay based on index
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, // Slide up to final position
        duration: 600,
        delay: index * 120 + 300,
        easing: Easing.out(Easing.back(1.1)), // Added a bounce effect
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
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
    </Animated.View>
  );
};

// --- Routes Component (Main Screen) ---
const Routes = ({ route, navigation }) => {
  const user = route.params?.user || {};

  const handleCardPress = (option) => {
    navigation.navigate(option.screen, { user, areaId: option.areaId });
  };

  // Animation for the Title/Subtitle block
  const titleOpacityAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Title animation runs immediately on mount
    Animated.parallel([
      Animated.timing(titleOpacityAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(titleSlideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleOpacityAnim, titleSlideAnim]);

  const animatedTitleStyle = {
    opacity: titleOpacityAnim,
    transform: [{ translateY: titleSlideAnim }],
  };

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

          {/* Animated Title Container */}
          <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
            <Text style={styles.title}>Customer Portfolio Overview</Text>
            <Text style={styles.subtitle}>
              Analyze your customer categories and performance data
            </Text>
          </Animated.View>

          {/* Dynamic Animated Card List */}
          <View style={styles.cardListContainer}>
            {ROUTE_OPTIONS.map((option, index) => (
              <AnimatedRouteCard
                key={option.areaId} // Unique key
                name={option.name}
                icon={option.icon}
                index={index} // Pass index for staggered delay
                onPress={() => handleCardPress(option)}
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

// --- Stylesheet (Updated to accommodate the card wrapper) ---
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
  // Wrapper for the Animated card
  cardWrapper: {
    width: "100%", 
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