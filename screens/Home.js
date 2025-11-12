import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Animated,
  Easing,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
  Platform,
} from "react-native";
// 💡 REQUIRED FOR AUTO-LOGIN CHECK: Import AsyncStorage (Ensure you have installed: @react-native-async-storage/async-storage)
import AsyncStorage from '@react-native-async-storage/async-storage'; 
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

// 💡 ATTENDANCE CONSTANTS
const PRIMARY_GRADIENT_START = "#8A56D3";
const PRIMARY_GRADIENT_END = "#5B2E9B";
const ATTENDANCE_SUBMIT_URL = `${baseUrl}/employee-attendance/punch`;

// 🖼️ Card Images
const cardImagePaths = {
  attendence: require("../assets/attendence.png"),
  collections: require("../assets/amtcollection.png"),
  qrCode: require("../assets/qr-code.png"),
  daybook: require("../assets/eventreminder.png"),
  targets: require("../assets/thetargeted.png"),
  myLeads: require("../assets/theLead.png"),
  addCustomers: require("../assets/theadd.png"),
  myCustomers: require("../assets/Mycustomers1.png"),
  myTasks: require("../assets/Target2.png"),
  reports: require("../assets/Reports2.png"),
  commission: require("../assets/thecommission.png"),
  groups: require("../assets/groups1.png"),
  customerOnHold: require("../assets/Holdon2.png"),
  monthlyTurnover: require("../assets/month.png"),
  DueReportImage: require("../assets/dues.png"),
  refer: require("../assets/refer.png"),
  rewards: require("../assets/rewards.png"),
  subscriptions: require("../assets/subscribe.png"),
  mychit: require("../assets/chit.png"),
  gold: require("../assets/gold.png"),
  loan: require("../assets/loan.png"),
  pigmy: require("../assets/pigme.png"),
};

// 💡 ATTENDANCE MODAL COMPONENT (Unchanged)
const AttendanceModal = ({
  attendanceLoading,
  selectedStatus,
  visible,
  message,
  onClose,
  handleSubmitAttendance,
  note,
  setNote,
}) => {
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const scaleAnim = useState(new Animated.Value(0.5))[0];

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.5);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }).start();
      setIsNoteOpen(false);
      setNote("");
    }
  }, [visible]);

  const animatedImageStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={[PRIMARY_GRADIENT_START, PRIMARY_GRADIENT_END]}
            style={modalStyles.iconHeader}
          >
            <Animated.Image
              source={cardImagePaths.attendence}
              style={[modalStyles.modalImage, animatedImageStyle]}
              resizeMode="contain"
            />
          </LinearGradient>

          <Text style={modalStyles.modalHeading}>Daily Status Check</Text>
          <Text style={modalStyles.modalText}>{message}</Text>

          {/* STYLISH ACCORDION HEADER (NOTE - OPTIONAL) */}
          <TouchableOpacity
            style={modalStyles.accordionHeader}
            onPress={() => setIsNoteOpen(!isNoteOpen)}
            activeOpacity={0.8}
          >
            <Text style={modalStyles.noteLabel}>
              {isNoteOpen ? "Hide Note" : "Add a Note (Optional)"}
            </Text>
            <Text style={modalStyles.arrowIcon}>
              {isNoteOpen ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {/* ACCORDION CONTENT (TEXT INPUT) */}
          {isNoteOpen && (
            <View style={modalStyles.accordionContent}>
              <TextInput
                style={modalStyles.inputField}
                placeholder="e.g., Working remotely today..."
                placeholderTextColor="#a0a0a0"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>
          )}
          {/* END ACCORDION */}

          <TouchableOpacity
            disabled={!selectedStatus || attendanceLoading}
            onPress={handleSubmitAttendance}
            style={modalStyles.markAttendanceButtonWrapper}
          >
            <LinearGradient
              colors={
                !selectedStatus
                  ? ["#B0B0B0", "#909090"]
                  : [PRIMARY_GRADIENT_START, PRIMARY_GRADIENT_END]
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={modalStyles.markAttendanceButton}
            >
              {attendanceLoading ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
              ) : (
                <Text style={modalStyles.markAttendanceButtonText}>
                  PRESENT
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 🔍 Search Bar Component (Unchanged)
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

// 🖼️ Banner Carousel Component (Unchanged)
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
      scrollRef.current?.scrollTo({ x: nextIndex * (width - 32), animated: true }); // Adjusted width for margin
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
        contentContainerStyle={{ paddingHorizontal: 16 }} // Apply padding here
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
              (index - 1) * (width - 32),
              index * (width - 32),
              (index + 1) * (width - 32),
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View key={index} style={[carouselStyles.dot, { opacity }]} />
          );
        })}
      </View>
    </View>
  );
};

const Home = ({ route, navigation }) => {
  // 1. 💡 REPLACED DESTRUCTURING with STATE HOOKS for session management
  const initialUser = route.params?.user || {};
  const initialAgentInfo = route.params?.agentInfo || {};
  
  const { setModifyPayment } = useContext(AgentContext);
  const [userState, setUserState] = useState(initialUser); // State for User data
  const [agentState, setAgentState] = useState(initialAgentInfo); // State for AgentInfo

  // 2. 💡 AUTO-LOGIN/SESSION CHECKING STATE
  const [isCheckingLogin, setIsCheckingLogin] = useState(
    !initialUser.userId // Start checking if user ID is missing from route params
  );

  const [agent, setAgent] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const netInfo = useNetInfo();
  const cardAnimations = useRef([]);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const qrCodeImage = require("../assets/upi_qr.png");

  // 💡 ATTENDANCE STATE
  const [selectedStatus, setSelectedStatus] = useState("Present");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [note, setNote] = useState("");


  // 3. 💡 AUTO-LOGIN/SESSION REVALIDATION EFFECT
  useEffect(() => {
    // Only run if initial user data is missing
    if (!initialUser.userId) {
      const revalidateSession = async () => {
        try {
          const userData = await AsyncStorage.getItem("user");
          const agentData = await AsyncStorage.getItem("agentInfo");

          if (userData && agentData) {
            const user = JSON.parse(userData);
            const agentInfo = JSON.parse(agentData);
            
            // Session found! Update state to re-hydrate the component
            setUserState(user);
            setAgentState(agentInfo);
            setIsCheckingLogin(false); 
          } else {
            // No session found, must navigate to login
            navigation.replace("Login"); // Use replace to clear the stack history
          }
        } catch (error) {
          console.error("Home.js: Failed to re-validate session:", error);
          // On error, force logout
          navigation.replace("Login"); 
        }
      };
      
      revalidateSession();
    } else {
        // Initial data was present in route.params, stop checking immediately
        setIsCheckingLogin(false);
    }
  }, []); // Run only on mount

  // All Cards (Filtered by permissions from agentState, and added Attendance card)
  const rawCardsData = [
    { id: "monthlyTurnover", name: "Monthly Turnover", imagePath: cardImagePaths.monthlyTurnover, onPress: () => navigation.navigate("MonthlyTurnover") },
    { id: "collections", name: "Collections", imagePath: cardImagePaths.collections, onPress: () => navigation.navigate("PaymentNavigator") },
    { id: "qrCode", name: "QR Code", imagePath: cardImagePaths.qrCode, onPress: () => navigation.navigate("qrCode") },
    { id: "daybook", name: "Daybook", imagePath: cardImagePaths.daybook, onPress: () => navigation.navigate("PayNavigation", { user: userState }) }, // 💡 Using userState
    { id: "commission", name: "Commissions", imagePath: cardImagePaths.commission, onPress: () => navigation.navigate("Commissions", { user: userState }) }, // 💡 Using userState
    { id: "targets", name: "Targets", imagePath: cardImagePaths.targets, onPress: () => navigation.navigate("Target") },
    { id: "myLeads", name: "My Leads", imagePath: cardImagePaths.myLeads, onPress: () => navigation.navigate("PayNavigation", { screen: "ViewLeads", params: { user: userState } }) }, // 💡 Using userState
    { id: "addCustomers", name: "Add Customers", imagePath: cardImagePaths.addCustomers, onPress: () => navigation.navigate("CustomerNavigation", { screen: "Customer", params: { user: userState } }) }, // 💡 Using userState
    { id: "myCustomers", name: "My Customers", imagePath: cardImagePaths.myCustomers, onPress: () => navigation.navigate("CustomerNavigation", { screen: "ViewEnrollments", params: { user: userState } }) }, // 💡 Using userState
    { id: "customerOnHold", name: "Customer On Hold", imagePath: cardImagePaths.customerOnHold, onPress: () => navigation.navigate("CustomerOnHold") },
    { id: "myTasks", name: "My Tasks", imagePath: cardImagePaths.myTasks, onPress: () => navigation.navigate("MyTasks", { employeeId: userState.userId, agentName: agent.name }) }, // 💡 Using userState
    { id: "reports", name: "Reports", imagePath: cardImagePaths.reports, onPress: () => navigation.navigate("PayNavigation", { screen: "Reports", params: { user: userState } }) }, // 💡 Using userState
    { id: "groups", name: "Groups", imagePath: cardImagePaths.groups, onPress: () => navigation.navigate("Enrollment", { screen: "Enrollment", params: { user: userState } }) }, // 💡 Using userState
    { id: "DueReport", name: "Due Report", imagePath: cardImagePaths.DueReportImage, onPress: () => navigation.navigate("PayNavigation", { screen: "Due", params: { user: userState } }) }, // 💡 Using userState
    { id: "attendence",name: "Attendance",imagePath: cardImagePaths.attendence,onPress: () => navigation.navigate("Attendance", { user: userState }), // 💡 Using userState
    },
  ].filter(Boolean);

  const cardsData = rawCardsData.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animate Cards (Unchanged logic, runs when cardsData changes)
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

  // 💡 HANDLE ATTENDANCE SUBMISSION - UPDATED to use userState
  const handleSubmitAttendance = async () => {
    try {
      setAttendanceLoading(true);

      const response = await axios.post(ATTENDANCE_SUBMIT_URL, {
        employee_id: userState?.userId, // 💡 Using userState
        status: selectedStatus, 
        method: "No Auth",
        type: "in",
        note: note,
      });
      const responseMessage = response?.data?.message;
      ToastAndroid.show(
        responseMessage ? responseMessage : "Attendance Marked Successfully",
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.log(error, "error");
      ToastAndroid.show("Failed to Mark Attendance", ToastAndroid.SHORT);
    } finally {
      setAttendanceLoading(false);
      setShowAttendanceModal(false);
      setNote("");
    }
  };


  // 💡 CHECK ATTENDANCE STATUS - UPDATED to use userState
  useEffect(() => {
    const checkAttendance = async () => {
      const ATTENDANCE_MODAL_URL = `${baseUrl}/employee-attendance/modal`;

      const body = {
        employee_id: userState.userId, // 💡 Using userState
      };

      try {
        const response = await axios.post(ATTENDANCE_MODAL_URL, { ...body });
        const data = response.data;

        if (data?.showModal === true) {
          setAttendanceMessage(data.message || "Eligible to mark attendance");
          setShowAttendanceModal(true);
        } else if (data?.message) {
          setShowAttendanceModal(false);
        } else {
          setShowAttendanceModal(false);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message;

        if (errorMessage !== "Attendance Already Marked") {
          console.error(
            "❌ Error checking attendance status:",
            errorMessage
          );
        } else {
          console.info("✅ Attendance check complete:", errorMessage);
        }
        setShowAttendanceModal(false);
      }
    };

    // 💡 Run check only if userState.userId is available and we're not checking login
    if (!isCheckingLogin && userState.userId && netInfo.isConnected) checkAttendance();
  }, [userState.userId, netInfo.isConnected, isCheckingLogin]); // 💡 Dependency updated to userState.userId and isCheckingLogin

  // Fetch Agent - UPDATED to use userState
  useEffect(() => {
    const fetchAgent = async () => {
      if (userState.userId) { // 💡 Using userState
        try {
          const response = await axios.get(
            `${baseUrl}/agent/get-agent-by-id/${userState.userId}` // 💡 Using userState
          );
          if (response.data) setAgent(response.data);
        } catch (error) {
          console.error("Error fetching agent:", error);
        }
      }
    };
    if (!isCheckingLogin && netInfo.isConnected) fetchAgent();
  }, [userState.userId, netInfo.isConnected, isCheckingLogin]); // 💡 Dependency updated to userState.userId and isCheckingLogin

  // Set Modify Payment Permission - UPDATED to use agentState
  useEffect(() => {
    if (agentState?.designation_id?.permission) { // 💡 Using agentState
      setModifyPayment(
        agentState.designation_id.permission.modify_payments === "true"
      );
    }
  }, [agentState, setModifyPayment]); // 💡 Dependency updated to agentState

  // QR Animation (Unchanged)
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
      seq.push(
        Animated.timing(new Animated.Value(0), {
          toValue: 0,
          duration: 40,
          useNativeDriver: false,
        })
      );
    }
    Animated.sequence(seq).start();

    const loopScanner = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
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

  // 4. 💡 LOADING SCREEN CHECK
  if (isCheckingLogin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DARK_VIOLET }}>
        <ActivityIndicator size="large" color={TEXT_LIGHT} />
      </View>
    );
  }

  return (
    <LinearGradient colors={[DARK_VIOLET, LIGHT_VIOLET]} style={styles.container}>
      <View style={styles.contentWrapper}>
        <Header />
        <Text style={styles.welcomeText}>Hello {agent.name || "Agent"},</Text>
        <Text style={styles.subText}>Welcome to MyChits Agent App</Text>

        {netInfo.isConnected && (
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}

        {!netInfo.isConnected ? (
          <View style={styles.noInternetContainer}>
            <Text style={styles.noInternetText}>No internet connection.</Text>
            <Text style={styles.noInternetSubText}>
              Please check your network.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* 🖼️ Banner Carousel */}
            <BannerCarousel />

            {/* 🔹 Cards Grid */}
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
                      style={[
                        styles.cardWrapper,
                        { opacity, transform: [{ scale }] },
                      ]}
                    >
                      <TouchableOpacity style={styles.card} onPress={card.onPress}>
                        <Image
                          source={card.imagePath}
                          style={styles.cardImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.cardText}>{card.name}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No modules found for "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>

            {/* 🌟 Special Section */}
            <View style={styles.specialCardContainer}>
              <TouchableOpacity
                style={styles.specialCard}
                onPress={() => navigation.navigate("ReferAndEarn")}
              >
                <Image
                  source={cardImagePaths.refer}
                  style={styles.specialIcon}
                  resizeMode="contain"
                />
                <View style={styles.specialTextContainer}>
                  <Text style={styles.specialTitle}>Refer & Earn</Text>
                  <Text style={styles.specialSubtitle}>
                    Invite friends and earn rewards
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.specialCard}
                onPress={() => navigation.navigate("Rewards")}
              >
                <Image
                  source={cardImagePaths.rewards}
                  style={styles.specialIcon}
                  resizeMode="contain"
                />
                <View style={styles.specialTextContainer}>
                  <Text style={styles.specialTitle}>Rewards</Text>
                  <Text style={styles.specialSubtitle}>
                    Check your earned points & perks
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.specialCard}
                onPress={() => navigation.navigate("RouteCustomerChit")}
              >
                <Image
                  source={cardImagePaths.subscriptions}
                  style={styles.specialIcon}
                  resizeMode="contain"
                />
                <View style={styles.specialTextContainer}>
                  <Text style={styles.specialTitle}>Subscriptions</Text>
                  <Text style={styles.specialSubtitle}>
                    Stay updated with your plans and perks
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 💰 MyChit Section */}
            <View style={styles.mychitSection}>
              <Text style={styles.mychitHeader}>Add Payments</Text>
              <View style={styles.mychitGrid}>
                {[
                  {
                    id: "mychit",
                    title: "MyChit",
                    img: cardImagePaths.mychit,
                    screen: "RouteCustomerChit",
                  },
                  {
                    id: "gold",
                    title: "Gold",
                    img: cardImagePaths.gold,
                    screen: "RouteCustomerGold",
                  },
                  {
                    id: "loan",
                    title: "Loan",
                    img: cardImagePaths.loan,
                    screen: "RouteCustomerLoan",
                  },
                  {
                    id: "pigmy",
                    title: "Pigmy",
                    img: cardImagePaths.pigmy,
                    screen: "RouteCustomerPigme",
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.mychitCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate(item.screen, { user: userState })} // 💡 Using userState
                  >
                    <Image source={item.img} style={styles.mychitIcon} />
                    <Text style={styles.mychitText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 🧾 QR Section */}
            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>MyChits Payment QR Code</Text>
              <Text style={styles.qrSubTitle}>Scan and pay via Kotak UPI</Text>

              <View style={styles.qrCard}>
                <Text style={styles.qrUpiText}>UPI ID: mychits@kotak</Text>
                <View style={styles.maskWrapper}>
                  <Image
                    source={qrCodeImage}
                    style={[styles.qrImage, { height: containerHeight }]}
                  />
                  <Animated.View
                    style={[
                      styles.revealOverlay,
                      {
                        height: Animated.subtract(
                          containerHeight,
                          revealHeight
                        ),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.scanLine,
                      { transform: [{ translateY: scanTranslateY }] },
                    ]}
                  />
                </View>
                <Text style={styles.qrBottomText}>
                  Powered by Kotak Mahindra Bank
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
      {/* 💡 ATTENDANCE MODAL RENDER */}
      <AttendanceModal
        attendanceLoading={attendanceLoading}
        selectedStatus={selectedStatus}
        visible={showAttendanceModal}
        message={attendanceMessage}
        onClose={() => setShowAttendanceModal(false)}
        handleSubmitAttendance={handleSubmitAttendance}
        note={note}
        setNote={setNote}
      />
    </LinearGradient>
  );
};

// 💜 STYLES (Unchanged)
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
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  rewardsCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    width: "48%",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e1065",
  },
  rewardsSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  rewardsImage: {
    width: 45,
    height: 45,
  },
  referCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    width: "48%",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e0ff",
  },
  referTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5b21b6",
  },
  referSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  referImage: {
    width: 45,
    height: 45,
  },
  announcementCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    width: "48%",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#fef9c3",
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
  },
  announcementSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  announcementImage: {
    width: 45,
    height: 45,
  },
  schemeCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    width: "48%",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },
  schemeSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  schemeImage: {
    width: 45,
    height: 45,
  },
  specialIcon: { width: 50, height: 50, marginRight: 12 },
  specialTextContainer: { flex: 1 },
  specialTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  specialSubtitle: { color: "#E3D7FF", fontSize: 13 },
  noInternetContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  noInternetText: { fontSize: 20, fontWeight: "bold", color: TEXT_LIGHT },
  noInternetSubText: { fontSize: 16, color: "#CBB7F4", marginTop: 10 },
  noResults: { alignItems: "center", paddingVertical: 40 },
  noResultsText: { color: "#D0BFFF", fontSize: 16 },
  qrSection: { marginTop: 20, alignItems: "center", marginBottom: 60 },
  qrTitle: {
    color: TEXT_LIGHT,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
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
  qrUpiText: {
    color: "#3C1E70",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 10,
  },
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

// 💡 ATTENDANCE MODAL STYLES (Unchanged)
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 50,
    borderWidth: 2,
    borderColor: PRIMARY_GRADIENT_END,
  },
  iconHeader: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: -80,
    shadowColor: PRIMARY_GRADIENT_END,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  modalImage: {
    width: 85,
    height: 65,
  },
  modalHeading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2c3e50",
    marginBottom: 5,
  },
  modalText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#7f8c8d",
    lineHeight: 22,
    marginBottom: 25,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 10,
  },
  closeButtonText: { fontSize: 28, fontWeight: "300", color: "#95a5a6" },
  accordionHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#34495e",
  },
  arrowIcon: {
    fontSize: 15,
    color: '#c2c3c4ff',
    fontWeight: "900",
  },
  accordionContent: {
    width: "100%",
    marginTop: 8,
    marginBottom: 10,
  },
  inputField: {
    width: "100%",
    minHeight: 90,
    borderColor: "#dcdcdc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#34495e",
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  markAttendanceButtonWrapper: {
    width: "100%",
    marginTop: 30,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: PRIMARY_GRADIENT_END,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  markAttendanceButton: {
    paddingVertical: 18,
    alignItems: "center",
  },
  markAttendanceButtonText: {
    color: TEXT_LIGHT,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 19,
    letterSpacing: 1,
  },
});

export default Home;