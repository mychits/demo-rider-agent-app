import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { enableScreens } from "react-native-screens";

import Home from "../screens/Home";
import Dashboard from "../screens/Dashboard";
import PaymentNavigator from "./PaymentNavigator";
import ProfileNavigator from "./ProfileNavigator";
import Attendence from "../screens/Attendence";
import COLORS from "../constants/color";

enableScreens();

const Tab = createBottomTabNavigator();

// 🎨 Violet Theme Colors
const INACTIVE_COLOR = "#C8A9FF";
const ACTIVE_COLOR = "#FFD700";
const FAB_BACKGROUND_COLOR = "#7F5AF0";
const ICON_COLOR_ON_FAB = "#FFFFFF";
const BACKGROUND_COLOR = "#CBB2FE";
const FAB_BORDER_COLOR = "#E8D9FF";

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    left: 20,
    elevation: 15,
    height: 75,
    borderRadius: 40,
    backgroundColor: BACKGROUND_COLOR,
    shadowColor: "#7F5AF0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E8D9FF",
  },
};

const BottomNavigation = ({ route }) => {
  const { user, agentInfo } = route.params || {};

  const getTabBarStyle = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "";
    if (
      [
        "ViewLeads",
        "Customer",
        "ViewEnrollments",
        "Reports",
        "Commissions",
        "Enrollment",
      ].includes(routeName)
    ) {
      return { display: "none" };
    }
    return null;
  };

  const ArchIcon = ({ focused, name, size, IconComponent }) => (
    <View style={{ alignItems: "center", paddingTop: 8 }}>
      <IconComponent
        name={name}
        size={size}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      {focused && <View style={styles.activeBar} />}
    </View>
  );

  const CenterIcon = ({ children, onPress }) => (
    <TouchableOpacity style={styles.centerFab} onPress={onPress}>
      <View style={styles.centerFabInner}>{children}</View>
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      {/* 🏠 Home */}
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ user, agentInfo }}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route),
          tabBarIcon: ({ focused }) => (
            <ArchIcon
              focused={focused}
              name={focused ? "home-variant" : "home-variant-outline"}
              size={28}
              IconComponent={MaterialCommunityIcons}
            />
          ),
        })}
      />

      {/* 📈 Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        initialParams={{ user, agentInfo }}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route),
          tabBarIcon: ({ focused }) => (
            <ArchIcon
              focused={focused}
              name={
                focused
                  ? "chart-areaspline"
                  : "chart-areaspline-variant"
              }
              size={28}
              IconComponent={MaterialCommunityIcons}
            />
          ),
        })}
      />

      {/* 🕒 Attendance - Center FAB */}
      <Tab.Screen
        name="Attendence"
        component={Attendence}
        initialParams={{ user, agentInfo }}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route),
          tabBarButton: (props) => <CenterIcon {...props} />,
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="calendar-clock"
              size={32}
              color={ICON_COLOR_ON_FAB}
            />
          ),
        })}
      />

      {/* 💰 Payments */}
      <Tab.Screen
        name="PaymentNavigator"
        component={PaymentNavigator}
        initialParams={{ user, agentInfo }}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route),
          tabBarIcon: ({ focused }) => (
            <ArchIcon
              focused={focused}
              name={focused ? "wallet" : "wallet-outline"}
              size={28}
              IconComponent={Ionicons}
            />
          ),
        })}
      />

      {/* ⚙️ Profile */}
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        initialParams={{ user, agentInfo }}
        options={({ route }) => ({
          tabBarStyle: getTabBarStyle(route),
          tabBarIcon: ({ focused }) => (
            <ArchIcon
              focused={focused}
              name={focused ? "settings" : "settings-outline"}
              size={28}
              IconComponent={Ionicons}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

// 💅 Styles
const styles = StyleSheet.create({
  centerFab: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  centerFabInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: FAB_BACKGROUND_COLOR,
    justifyContent: "center",
    alignItems: "center",
    elevation: 20,
    shadowColor: "#7F5AF0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    borderWidth: 4,
    borderColor: FAB_BORDER_COLOR,
  },
  activeBar: {
    height: 3,
    width: 20,
    backgroundColor: ACTIVE_COLOR,
    borderRadius: 2,
    marginTop: 6,
  },
});

export default BottomNavigation;
