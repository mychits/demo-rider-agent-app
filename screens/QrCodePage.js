import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Image,
  StyleSheet,
  Platform,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../components/Header";

const COLORS = {
  primary: "#6C2DC7",
  secondary: "#9D50BB",
  white: "#FFFFFF",
  textLight: "#E0D6FF",
  textDark: "#2E1C5D",
};

const QrScannerRevealPage = () => {
  const qrCodeImage = require("../assets/kotak_bank_qr.jpeg");

  // Controls overall reveal height (0 -> fullHeight)
  const revealAnim = useRef(new Animated.Value(0)).current;

  // Controls the scanner line vertical position (animated loop)
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // We'll animate in steps to make "bit-by-bit" reveal
  useEffect(() => {
    // Number of reveal steps (higher -> slower, more granular)
    const STEPS = 8;

    // Duration per step (ms)
    const STEP_DURATION = 140;

    // Build sequence of small increments from 0 -> 1 (normalized)
    const seq = [];
    for (let i = 1; i <= STEPS; i++) {
      seq.push(
        Animated.timing(revealAnim, {
          toValue: i / STEPS,
          duration: STEP_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // height interpolation uses layout props
        })
      );
      // small pause for "bit" effect
      seq.push(
        Animated.timing(new Animated.Value(0), {
          toValue: 0,
          duration: 40,
          useNativeDriver: false,
        })
      );
    }

    // Start the reveal sequence
    Animated.sequence(seq).start();

    // Scanner line loop: moves from top to bottom repeatedly
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

    // cleanup
    return () => {
      loopScanner.stop();
      revealAnim.stopAnimation();
    };
  }, [revealAnim, scanLineAnim]);

  // Interpolations:
  // - revealHeight will be a fraction (0..1) of the QR container height.
  // - scanLine translate uses the same container height but animated using transform.
  const containerHeight = 320; // should match qrImage height (or be slightly larger)
  const revealHeight = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerHeight],
  });

  const scanTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, containerHeight + 20], // start a bit above, end below
  });

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.headerWrapper}>
          <Header />
        </View>

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>MyChits Payment QR Code</Text>
            <Text style={styles.subtitle}>Scan and pay via Kotak UPI</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoContainer_QR}>
              <Text style={styles.upiText}>UPI ID: mychits@kotak</Text>
            </View>

            {/* Mask container: overflow hidden so animated height reveals the image */}
            <View style={styles.maskWrapper}>
              {/* The actual image stays fixed; we reveal by changing overlay height */}
              <Image
                source={qrCodeImage}
                style={[styles.qrImage, { height: containerHeight }]}
                resizeMode="contain"
              />

              {/* Reveal overlay: white rectangle that shrinks in height to reveal image.
                  We place it ABOVE the image and reduce its height to uncover image from top -> down */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.revealOverlay,
                  {
                    height: Animated.subtract(containerHeight, revealHeight),
                  },
                ]}
              />

              {/* Scanner line (semi-transparent bright strip) moving top->down */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanTranslateY }],
                    opacity: 0.95,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.infoContainer_Bottom}>
            <Text style={styles.infoText}>Scan this QR code to make payments</Text>
            <Text style={styles.infoSubText}>Powered by Kotak Mahindra Bank</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  headerWrapper: {
    marginTop: Platform.OS === "android" ? 50 : 70,
    marginLeft: 10,
  },
  container: { flex: 1, padding: 16 },
  header: { alignItems: "center", marginBottom: 14 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 6,
  },

  card: {
    marginTop: 18,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  infoContainer_QR: { marginBottom: 12 },
  upiText: { fontSize: 16, fontWeight: "600", color: COLORS.textDark },

  // Mask wrapper which holds image and overlays; position: 'relative' is default
  maskWrapper: {
    width: 260,
    height: 320, // must match containerHeight variable above
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  qrImage: {
    width: 240,
  },

  // Reveal overlay (covers the image initially). We'll animate its height to uncover.
  revealOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff", // same as card background so it looks like "cover"
  },

  // The moving scanner line
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 28,
    // gradient-like effect using rgba
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    borderBottomColor: "rgba(255,255,255,0.06)",
    // Add subtle glow
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  infoContainer_Bottom: { alignItems: "center", marginTop: 18 },
  infoText: { color: COLORS.white, fontSize: 15, marginBottom: 4 },
  infoSubText: { color: COLORS.textLight, fontSize: 13 },
});

export default QrScannerRevealPage;
