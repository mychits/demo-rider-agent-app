import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Platform,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const COLOR_PALETTE = {
    primary: "#6C2DC7", // Deep violet
    secondary: "#3B1E7A", // Dark violet tone
    white: "#FFFFFF",
    textDark: "#2C2C2C",
    textLight: "#777777",
    accent: "#8B5CF6", // Soft purple accent
    cardBackground: "#FFFFFF",
    shadowColor: "rgba(0,0,0,0.15)",
    buttonGradientStart: "#7C3AED",
    buttonGradientEnd: "#A78BFA",
};

const headerImage = require('../assets/hero1.jpg');

export default function TaskDetailScreen({ navigation, route }) {
    const { task } = route.params;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return COLOR_PALETTE.accent;
            case 'Pending':
                return COLOR_PALETTE.secondary;
            case 'In Progress':
                return COLOR_PALETTE.primary;
            default:
                return COLOR_PALETTE.textLight;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLOR_PALETTE.primary }}>
            <StatusBar barStyle="light-content" backgroundColor={COLOR_PALETTE.primary} />
            
            {/* Violet Rounded Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
                    <Ionicons name="chevron-back" size={32} color={COLOR_PALETTE.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                <Image source={headerImage} style={styles.headerImage} />
            </View>

            {/* White Content Section */}
            <SafeAreaView style={styles.contentWrapper}>
                <View style={styles.card}>
                    <Text style={styles.taskTitle}>{task.taskTitle}</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={20} color={COLOR_PALETTE.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>Description:</Text>
                        <Text style={styles.taskDetail}>{task.taskDescription}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="stats-chart-outline" size={20} color={COLOR_PALETTE.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>Status:</Text>
                        <Text style={[styles.taskDetail, { color: getStatusColor(task.status), fontWeight: 'bold' }]}>{task.status}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={20} color={COLOR_PALETTE.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>Start Date:</Text>
                        <Text style={styles.taskDetail}>{new Date(task.startDate).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-sharp" size={20} color={COLOR_PALETTE.secondary} style={styles.detailIcon} />
                        <Text style={styles.detailLabel}>End Date:</Text>
                        <Text style={styles.taskDetail}>{new Date(task.endDate).toLocaleDateString()}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.markCompleteButtonWrapper}
                        onPress={() => navigation.navigate('CompleteTask', { taskId: task._id })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[COLOR_PALETTE.buttonGradientStart, COLOR_PALETTE.buttonGradientEnd]}
                            style={styles.markCompleteButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.markCompleteButtonText}>Mark as Complete</Text>
                            <Ionicons name="checkmark-circle-outline" size={24} color={COLOR_PALETTE.white} style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLOR_PALETTE.primary,
        height: 140,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: Platform.OS === "android" ? 40 : 60,
    },
    backArrow: { padding: 5 },
    headerTitle: {
        color: COLOR_PALETTE.white,
        fontSize: 28,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    headerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: COLOR_PALETTE.white,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    card: {
        backgroundColor: COLOR_PALETTE.cardBackground,
        borderRadius: 20,
        padding: 25,
        width: '100%',
        maxWidth: 450,
        alignItems: 'center',
        shadowColor: COLOR_PALETTE.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,

        
    },
    taskTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: COLOR_PALETTE.primary,
        marginBottom: 25,
        textAlign: "center",
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    detailIcon: { marginRight: 10 },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLOR_PALETTE.secondary,
        flexShrink: 0,
    },
    taskDetail: {
        flex: 1,
        fontSize: 16,
        color: COLOR_PALETTE.textDark,
        textAlign: 'right',
        paddingLeft: 10,
    },
    markCompleteButtonWrapper: {
        width: '100%',
        marginTop: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markCompleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width * 0.75,
        height: 60,
        borderRadius: 30,
        shadowColor: COLOR_PALETTE.buttonGradientEnd,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    markCompleteButtonText: {
        color: COLOR_PALETTE.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.8,
    },
});
