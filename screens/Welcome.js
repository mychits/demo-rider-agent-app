import React, { useEffect } from "react";
import { View, Image, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Welcome = ({ navigation }) => {
  // Auto navigate after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login"); // replace so user can't go back
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={["#4B0082", "#7B2CBF", "#4B0082"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4B0082" />
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/CityChits.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200, // small size
    height: 180,
  },
});

export default Welcome;
