import React from "react";
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    Platform, 
    StatusBar 
} from "react-native";
// Using Feather Icons for a cleaner, modern look
import Icon from "react-native-vector-icons/Feather"; 
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// --- VIOLET THEME CONSTANTS ---
const VIOLET_COLORS = {
    primary: "#6C2DC7",     // Main violet
    secondary: "#9D50BB",    // Gradient accent
    darkViolet: "#3B1E7A",    // Darkest text/primary color
    neutralGrey: "#6b7280",  // Neutral grey for subtle text
    lightBackground: "#F4EEFB", // Very light violet background
    white: "#FFFFFF",
    textSubtle: "#E0D6FF",
    borderLight: "#ddd6fe",  // Light violet border
    gradientBackground: ["#e0cffc", "#a267e7"], // Light to deep violet gradient (for the card accent)
    gradientHeader: ["#6C2DC7", "#9D50BB"], // Gradient for Header area
    cardBorder: "#6C2DC7",
};

// --- Custom Card Component with Violet Theme ---
const CustomRouteCard = ({ name, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} style={cardStyles.card}>
        <LinearGradient 
            colors={VIOLET_COLORS.gradientBackground}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={cardStyles.iconWrapper}
        >
            <Icon name={icon} style={cardStyles.cardIcon} />
        </LinearGradient>
        
        <View style={cardStyles.textContainer}>
            <Text style={cardStyles.cardText} numberOfLines={2}>{name}</Text>
            <Text style={cardStyles.cardSubText}>View detailed outstanding data</Text>
        </View>
        <Icon name="chevron-right" style={cardStyles.arrowIcon} />
    </TouchableOpacity>
);

const Due = ({ route, navigation }) => {
    // Defensive destructuring 
    const { user } = route.params;

    // Handler for the back button
    const handleBackPress = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            console.log("Cannot go back. Add alternative navigation here.");
        }
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor={VIOLET_COLORS.primary} />
            
            {/* Top Gradient Header Area */}
            <LinearGradient 
                colors={VIOLET_COLORS.gradientHeader} 
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Custom Header with Back Button and Simple Title */}
                <View style={styles.customHeader}>
                    {/* Back Button (Circle Formation) */}
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Icon name="arrow-left" size={20} color={VIOLET_COLORS.primary} />
                    </TouchableOpacity>

                    {/* Simple Professional Title */}
                    <Text style={styles.appTitle}>Reports</Text>

                    {/* Placeholder to balance the layout */}
                    <View style={styles.backButtonPlaceholder} /> 
                </View>

                {/* Main Title Section */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Outstanding Reports</Text>
                    <Text style={styles.subtitle}>Select a report type to manage dues</Text>
                </View>
            </LinearGradient>

            {/* Scrollable Content Area */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cardListContainer}>
                    <CustomRouteCard
                        name="Collection Report"
                        icon="file-text" 
                        onPress={() => navigation.navigate("OutstandingReports", { user })}
                    />
                    <CustomRouteCard
                        name="Referred Report"
                        icon="users" 
                        onPress={() => navigation.navigate("ReferredReport", { user })}
                    />
                    <CustomRouteCard
                        name="Relationship Manager Report"
                        icon="briefcase" 
                        onPress={() => navigation.navigate("RelationshipManagerReport", { user })}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// =================================================================
// PAGE-LEVEL STYLES
// =================================================================
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: VIOLET_COLORS.lightBackground,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
        paddingBottom: 25,
        paddingHorizontal: 22,
    },
    
    // --- CUSTOM HEADER STYLES ---
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18, // Circle formation
        backgroundColor: VIOLET_COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle shadow for the floating circle button
        shadowColor: VIOLET_COLORS.darkViolet,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    // Placeholder to align the title center when a back button is present
    backButtonPlaceholder: { 
        width: 36, 
        height: 36, 
        opacity: 0 
    }, 
    appTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: VIOLET_COLORS.white,
    },
    // ----------------------------

    titleContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: VIOLET_COLORS.white,
    },
    subtitle: {
        fontSize: 16,
        color: VIOLET_COLORS.textSubtle, 
        marginTop: 5,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 22,
        paddingTop: 20, 
        paddingBottom: 40,
    },
    cardListContainer: {
        gap: 15,
        
    },
});

// =================================================================
// CARD-LEVEL STYLES (Kept consistent)
// =================================================================
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: VIOLET_COLORS.white,
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        shadowColor: VIOLET_COLORS.darkViolet,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardIcon: {
        fontSize: 22,
        color: VIOLET_COLORS.white,
    },
    textContainer: {
        flex: 1,
        marginLeft: 15,
    },
    cardText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: VIOLET_COLORS.darkViolet,
    },
    cardSubText: {
        fontSize: 13,
        color: VIOLET_COLORS.neutralGrey,
        marginTop: 2,
    },
    arrowIcon: {
        fontSize: 20,
        color: VIOLET_COLORS.primary,
        marginLeft: 10,
    },
});

export default Due;


