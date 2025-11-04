import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Easing,
  TextInput,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import baseUrl from "../constants/baseUrl";
import Header from "../components/Header";
import { AgentContext } from "../context/AgentContextProvider";
import { useNetInfo } from "@react-native-community/netinfo";

const { width } = Dimensions.get("window");

// 💜 Violet Theme
const DARK_VIOLET = "#3C1E70";
const LIGHT_VIOLET = "#5B2E9B";
const ACCENT_VIOLET = "#8A56D3";
const TEXT_LIGHT = "#F5F1FF";
const CARD_BG = "#4E2A86";

// 🖼️ Card Images
const cardImagePaths = {
  attendence: require("../assets/ab.png"),
  collections: require("../assets/Collection2.png"),
  qrCode: require("../assets/qr-code.png"),
  daybook: require("../assets/Daybook2.png"),
  targets: require("../assets/Target2.png"),
  myLeads: require("../assets/Lead1.png"),
  addCustomers: require("../assets/AddCutomer1.png"),
  myCustomers: require("../assets/Mycustomers1.png"),
  myTasks: require("../assets/Target2.png"),
  reports: require("../assets/Reports2.png"),
  commission: require("../assets/commissions1.png"),
  groups: require("../assets/groups1.png"),
  customerOnHold: require("../assets/Holdon2.png"),
  monthlyTurnover: require("../assets/MITB.png"),
  DueReportImage: require("../assets/dues.png"),
  refer: require("../assets/refer.png"), // 🔹 Add your icon image here 
  rewards: require("../assets/rewards.png"), // 🔹 Add your icon image here
  subscriptions: require("../assets/subscribe.png"),
   mychit: require("../assets/chit.png"), // you can replace with your own
  gold: require("../assets/gold.png"),
  loan: require("../assets/loan.png"),
  pigmy: require("../assets/pigme.png"),
};

// 🔍 Search Bar Component
const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <View style={searchStyles.container}>
    <Icon name="search" size={22} color="#fff" style={searchStyles.icon} />
    <TextInput
      style={searchStyles.input}
      placeholder="Search modules or customers..."
      placeholderTextColor="#DDD"
      value={searchQuery}
      onChangeText={(text) => setSearchQuery(text)}
    />
    {searchQuery.length > 0 && (
      <TouchableOpacity
        onPress={() => setSearchQuery("")}
        style={searchStyles.clearButton}
      >
        <Icon name="clear" size={20} color="#fff" />
      </TouchableOpacity>
    )}
  </View>
);

// 🖼️ Banner Carousel Component
const BannerCarousel = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    "https://media.istockphoto.com/id/1374485787/vector/3d-credit-card-money-financial-security-for-online-shopping-online-payment-credit-card-with.jpg?s=612x612&w=0&k=20&c=fQ_0faElpY4hqtpWWe1PuiHgpJvhy9_bVFeMZlQntvw=",
    "https://media.istockphoto.com/id/1318983438/vector/cartoon-men-and-women-using-mobile-applications.jpg?s=612x612&w=0&k=20&c=QO7dfYSiitUrUSgLYgVvW-DNxmkkHNbUUAOSSW3IqXw=",
    "https://media.istockphoto.com/id/2150836874/vector/flat-vector-mobile-application-developer-and-designer-team-planning-process-working-concept.jpg?s=612x612&w=0&k=20&c=CK48Ui8oDUiD3qA8vVRd_E7o_QeU2v00ZqIeaIX2ooo=",
    "https://media.istockphoto.com/id/1149446411/vector/refer-a-friend-concept-vector.jpg?s=612x612&w=0&k=20&c=4fUgEfN-JP15Kfl4GHqU5D8CAqr4qmR55Ls4hfrG5bY=",
    "https://media.istockphoto.com/id/532580000/photo/woman-pressing-multimedia-and-entertainment-icons-on-a-virtual-background.jpg?s=612x612&w=0&k=20&c=ww9WN0FSWx0bOeKq0Kp2cBU7MWoGxEivWSlNhDSryiQ=",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={carouselStyles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {banners.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={carouselStyles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={carouselStyles.indicatorContainer}>
        {banners.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return <Animated.View key={index} style={[carouselStyles.dot, { opacity }]} />;
        })}
      </View>
    </View>
  );
};

const Home = ({ route, navigation }) => {
  const { user = {} } = route.params || {};
  const { setModifyPayment } = useContext(AgentContext);
  const [agent, setAgent] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const netInfo = useNetInfo();
  const cardAnimations = useRef([]);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const qrCodeImage = require("../assets/kotak_bank_qr.jpeg");

  // All Cards
  const rawCardsData = [
    { id: "monthlyTurnover", name: "Monthly Turnover", imagePath: cardImagePaths.monthlyTurnover, onPress: () => navigation.navigate("MonthlyTurnover") },
    { id: "collections", name: "Collections", imagePath: cardImagePaths.collections, onPress: () => navigation.navigate("PaymentNavigator") },
    { id: "qrCode", name: "QR Code", imagePath: cardImagePaths.qrCode, onPress: () => navigation.navigate("qrCode") },
    { id: "daybook", name: "Daybook", imagePath: cardImagePaths.daybook, onPress: () => navigation.navigate("PayNavigation", { user }) },
    { id: "commission", name: "Commissions", imagePath: cardImagePaths.commission, onPress: () => navigation.navigate("Commissions", { user }) },
    { id: "targets", name: "Targets", imagePath: cardImagePaths.targets, onPress: () => navigation.navigate("Target") },
    { id: "myLeads", name: "My Leads", imagePath: cardImagePaths.myLeads, onPress: () => navigation.navigate("PayNavigation", { screen: "ViewLeads", params: { user } }) },
    { id: "addCustomers", name: "Add Customers", imagePath: cardImagePaths.addCustomers, onPress: () => navigation.navigate("CustomerNavigation", { screen: "Customer", params: { user } }) },
    { id: "myCustomers", name: "My Customers", imagePath: cardImagePaths.myCustomers, onPress: () => navigation.navigate("CustomerNavigation", { screen: "ViewEnrollments", params: { user } }) },
    { id: "customerOnHold", name: "Customer On Hold", imagePath: cardImagePaths.customerOnHold, onPress: () => navigation.navigate("CustomerOnHold") },
    { id: "myTasks", name: "My Tasks", imagePath: cardImagePaths.myTasks, onPress: () => navigation.navigate("MyTasks", { employeeId: user.userId, agentName: agent.name }) },
    { id: "reports", name: "Reports", imagePath: cardImagePaths.reports, onPress: () => navigation.navigate("PayNavigation", { screen: "Reports", params: { user } }) },
    { id: "groups", name: "Groups", imagePath: cardImagePaths.groups, onPress: () => navigation.navigate("Enrollment", { screen: "Enrollment", params: { user } }) },
    { id: "DueReport", name: "Due Report", imagePath: cardImagePaths.DueReportImage, onPress: () => navigation.navigate("PayNavigation", { screen: "Due", params: { user } }) },
  ];

  const cardsData = rawCardsData.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animate Cards
  if (cardAnimations.current.length !== cardsData.length) {
    cardAnimations.current = cardsData.map(
      (_, i) => cardAnimations.current[i] || new Animated.Value(0)
    );
  }

  useEffect(() => {
    if (cardsData.length > 0 && netInfo.isConnected) {
      const animations = cardsData.map((_, index) =>
        Animated.timing(cardAnimations.current[index], {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();
    }
  }, [cardsData, netInfo.isConnected]);

  // Fetch Agent
  useEffect(() => {
    const fetchAgent = async () => {
      if (user.userId) {
        try {
          const response = await axios.get(`${baseUrl}/agent/get-agent-by-id/${user.userId}`);
          if (response.data) setAgent(response.data);
        } catch (error) {
          console.error("Error fetching agent:", error);
        }
      }
    };
    if (netInfo.isConnected) fetchAgent();
  }, [user.userId, netInfo.isConnected]);

  // QR Animation
  useEffect(() => {
    const STEPS = 8;
    const STEP_DURATION = 140;
    const seq = [];
    for (let i = 1; i <= STEPS; i++) {
      seq.push(
        Animated.timing(revealAnim, {
          toValue: i / STEPS,
          duration: STEP_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      );
      seq.push(Animated.timing(new Animated.Value(0), { toValue: 0, duration: 40, useNativeDriver: false }));
    }
    Animated.sequence(seq).start();

    const loopScanner = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    loopScanner.start();
    return () => loopScanner.stop();
  }, []);

  const containerHeight = 280;
  const revealHeight = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerHeight],
  });
  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, containerHeight + 20],
  });

  return (
    <LinearGradient colors={[DARK_VIOLET, LIGHT_VIOLET]} style={styles.container}>
      <View style={styles.contentWrapper}>
        <Header />
        <Text style={styles.welcomeText}>Hello {agent.name || "Agent"},</Text>
        <Text style={styles.subText}>Welcome to MyChits Agent App</Text>

        {netInfo.isConnected && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

        {/* 🖼️ Banner Carousel Section */}
        {netInfo.isConnected && <BannerCarousel />}

        {!netInfo.isConnected ? (
          <View style={styles.noInternetContainer}>
            <Text style={styles.noInternetText}>No internet connection.</Text>
            <Text style={styles.noInternetSubText}>Please check your network.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollView}>
            {/* Cards */}
            <View style={styles.cardsGrid}>
              {cardsData.length > 0 ? (
                cardsData.map((card, index) => {
                  const scale = cardAnimations.current[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  });
                  const opacity = cardAnimations.current[index];
                  return (
                    <Animated.View
                      key={card.id}
                      style={[styles.cardWrapper, { opacity, transform: [{ scale }] }]}
                    >
                      <TouchableOpacity style={styles.card} onPress={card.onPress}>
                        <Image source={card.imagePath} style={styles.cardImage} resizeMode="contain" />
                        <Text style={styles.cardText}>{card.name}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No modules found for "{searchQuery}"</Text>
                </View>
              )}
            </View>

            {/* 🌟 NEW SECTION: REFER & REWARDS */}
            <View style={styles.specialCardContainer}>
              <TouchableOpacity style={styles.specialCard} onPress={() => navigation.navigate("ReferAndEarn")}>
                <Image source={cardImagePaths.refer} style={styles.specialIcon} resizeMode="contain" />
                <View style={styles.specialTextContainer}>
                  <Text style={styles.specialTitle}>Refer & Earn</Text>
                  <Text style={styles.specialSubtitle}>Invite friends and earn rewards</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.specialCard} onPress={() => navigation.navigate("Rewards")}>
                <Image source={cardImagePaths.rewards} style={styles.specialIcon} resizeMode="contain" />
                <View style={styles.specialTextContainer}>
                  <Text style={styles.specialTitle}>Rewards</Text>
                  <Text style={styles.specialSubtitle}>Check your earned points & perks</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.specialCard} onPress={() => navigation.navigate("RouteCustomerChit")}>
                <Image source={cardImagePaths.subscriptions} style={styles.specialIcon} resizeMode="contain" />
                <View style={styles.specialTextContainer}>
                  <Text style={styles.specialTitle}>Subscriptions</Text>
                  <Text style={styles.specialSubtitle}>Stay updated with your plans and earned perks</Text>
                </View>
              </TouchableOpacity>
              

            </View>
            
<View style={styles.mychitSection}>
  <Text style={styles.mychitHeader}>Add Payments </Text>
  <View style={styles.mychitGrid}>
    {[
      { id: "mychit", title: "MyChit", img: cardImagePaths.mychit, screen: "RouteCustomerChit" },
      { id: "gold", title: "Gold", img: cardImagePaths.gold, screen: "RouteCustomerGold" },
      { id: "loan", title: "Loan", img: cardImagePaths.loan, screen: "RouteCustomerLoan" },
      { id: "pigmy", title: "Pigmy", img: cardImagePaths.pigmy, screen: "RouteCustomerPigme" },
    ].map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.mychitCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate(item.screen)}
      >
        <Image source={item.img} style={styles.mychitIcon} />
        <Text style={styles.mychitText}>{item.title}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>




            {/* ✅ QR SCANNER SECTION BELOW */}
            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>MyChits Payment QR Code</Text>
              <Text style={styles.qrSubTitle}>Scan and pay via Kotak UPI</Text>

              <View style={styles.qrCard}>
                <Text style={styles.qrUpiText}>UPI ID: mychits@kotak</Text>
                <View style={styles.maskWrapper}>
                  <Image source={qrCodeImage} style={[styles.qrImage, { height: containerHeight }]} />
                  <Animated.View
                    style={[styles.revealOverlay, { height: Animated.subtract(containerHeight, revealHeight) }]}
                  />
                  <Animated.View
                    style={[styles.scanLine, { transform: [{ translateY: scanTranslateY }] }]}
                  />
                </View>
                <Text style={styles.qrBottomText}>Powered by Kotak Mahindra Bank</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

// 💜 Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, marginHorizontal: 16, marginTop: 40 },
  welcomeText: { fontSize: 26, fontWeight: "bold", color: TEXT_LIGHT },
  subText: { fontSize: 18, color: "#D8CFFF", marginBottom: 15 },
  scrollView: { paddingBottom: 80 },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cardWrapper: {
    width: (width - 16 * 2 - 20) / 3,
    height: (width - 16 * 2 - 20) / 3,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: { width: 80, height: 50 },
  cardText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_LIGHT,
    textAlign: "center",
  },
  mychitSection: {
   
   
    padding: 12,
    marginBottom: 30,
  },
  mychitHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  mychitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mychitCard: {
    width: (width - 16 * 2 - 40) / 2,
    backgroundColor: CARD_BG,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#fff",
  },
  mychitIcon: { width: 60, height: 60, marginBottom: 8 },
  mychitText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  // 💎 Special Refer & Rewards Section
  specialCardContainer: {
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 14,
    padding: 10,
    backgroundColor: LIGHT_VIOLET,
  },
  specialCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  specialIcon: { width: 50, height: 50, marginRight: 12 },
  specialTextContainer: { flex: 1 },
  specialTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  specialSubtitle: { color: "#E3D7FF", fontSize: 13 },
  noInternetContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  noInternetText: { fontSize: 20, fontWeight: "bold", color: TEXT_LIGHT },
  noInternetSubText: { fontSize: 16, color: "#CBB7F4", marginTop: 10 },
  noResults: { alignItems: "center", paddingVertical: 40 },
  noResultsText: { color: "#D0BFFF", fontSize: 16 },
  qrSection: { marginTop: 20, alignItems: "center", marginBottom: 60 },
  qrTitle: { color: TEXT_LIGHT, fontSize: 20, fontWeight: "700", textAlign: "center" },
  qrSubTitle: { color: "#D6C6FF", fontSize: 14, marginBottom: 10 },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    width: "90%",
  },
  qrUpiText: { color: "#3C1E70", fontWeight: "600", fontSize: 15, marginBottom: 10 },
  maskWrapper: {
    width: 260,
    height: 280,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  qrImage: { width: 240 },
  revealOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  qrBottomText: { color: "#3C1E70", marginTop: 10, fontSize: 13 },
});

const searchStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_VIOLET,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 15,
    height: 48,
    elevation: 4,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#fff", paddingVertical: 0 },
  clearButton: { padding: 5, marginLeft: 10 },
});


// 🎠 Banner Carousel Styles
const carouselStyles = StyleSheet.create({
  container: {
    height: 160,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  image: {
    width: width - 32,
    height: 160,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});

export default Home;
