import React, { useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, // <-- Import Animated
  Easing // <-- Import Easing for smooth transitions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
// Assuming Header component is in '../components/Header'
import Header from "../components/Header"; 

// --- Color Palette ---
const COLOR_PALETTE = {
  primary: "#6C2DC7", // violet
  secondary: "#3B1E7A", // purple-pink
  white: "#FFFFFF",
  textDark: "#1A1A1A",
  textLight: "#666666",
  accent: "#957cb9ff", // deeper violet accent for borders/icons
};

// --- Dynamic Data for Payment Options ---
const PAYMENT_OPTIONS = [
  { name: "Chits Reports", icon: "money", screen: "ChitPayment", areaId: "chits" },
  { name: "Gold Chit Reports", icon: "credit-card", screen: "GoldPayment", areaId: "gold-chits" },
  { name: "Loan Reports", icon: "bank", screen: "LoanPayments", areaId: "loans" },
  { name: "Pigme Reports", icon: "briefcase", screen: "PigmePayments", areaId: "pigmy" },
];

// --- Animated PaymentCard Component ---
const AnimatedPaymentCard = ({ name, icon, onPress, index }) => {
  // Animated value for each card's opacity and vertical position
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0
  const slideAnim = useRef(new Animated.Value(50)).current; // Initial Y position 50 (below its final place)

  useEffect(() => {
    // Sequence of animations for each card with a staggered delay
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade to full opacity
        duration: 500,
        delay: index * 100 + 300, // Staggered delay based on index + overall start delay
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, // Slide up to final position (0 offset)
        duration: 600,
        delay: index * 100 + 300,
        easing: Easing.out(Easing.back(1.1)), // A slight bounce effect
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
    </Animated.View>
  );
};


// --- PaymentList Component (Main Screen) ---
const PaymentList = ({ route, navigation }) => {
  const user = route.params?.user || {}; 

  const handleCardPress = (option) => {
    navigation.navigate(option.screen, { user, areaId: option.areaId });
  };

  // Animation for the Title/Header block (runs immediately on mount)
  const titleOpacityAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
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
          showsVerticalScrollIndicator={false} // Cleaner look
        >
          {/* Header Component */}
          <Header /> 

          {/* Animated Page Title */}
          <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
            <Text style={styles.title}>Reports 🧾</Text>
            <Text style={styles.subtitle}>view a payment type to continue</Text>
          </Animated.View>

          {/* Dynamic Animated Payment Options List */}
          <View style={styles.cardListContainer}>
            {PAYMENT_OPTIONS.map((option, index) => (
              <AnimatedPaymentCard
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
    </SafeAreaView>
  );
};

// --- Stylesheet ---
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
  // We use this wrapper to apply animation to the card block
  cardWrapper: {
    width: "100%", // Take full width of the container
    alignItems: "center",
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
    gap: 20, // Replaces margin/padding between items
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