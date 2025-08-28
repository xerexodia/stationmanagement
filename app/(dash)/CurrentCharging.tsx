import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useReservationService } from "../../services/reservationService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useStorageState } from "../../hooks/useStorageState";

dayjs.extend(utc);

interface Reservation {
  id: number;
  startsAt: string;
  expiresAt: string;
  estimatedPrice: number;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  review: any;
  reservationConfig: {
    id: number;
    tolerance: number;
    maxReservation: number;
    minNoticePeriod: number;
    cancellationPolicy: string;
    nreservation: number;
  };
  penalty: any;
  sessionId?: string;
}

const CurrentChargingScreen = () => {
  const [[_, sessionId], setSession] = useStorageState("sessionId");
  console.log("🚀 ~ CurrentChargingScreen ~ sessionId:", sessionId)

  const router = useRouter();
  const { fetchActiveSession, endChargingSession } = useReservationService();

  const [reservation, setReservation] = useState<Reservation | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState("00:00:00");
  const [energyConsumed, setEnergyConsumed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const calculateTimeRemaining = (expiresAt: string) => {
    const now = dayjs.utc();
    const end = dayjs.utc(expiresAt);
    const diff = Math.max(0, end.diff(now, "second"));
    return formatTime(diff);
  };

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchActiveSession();
      if (!response) {
        setError("No active charging session found");
        return;
      }

      // Store reservation with sessionId
      setReservation({ ...response, sessionId: sessionId } as Reservation);

      // Parse start and end times
      const start = dayjs.utc(response.startsAt);
      const end = dayjs.utc(response.expiresAt);
      const now = dayjs.utc();

      setStartTime(start);
      setEndTime(end);

      // Calculate total session duration in seconds
      const totalSeconds = end.diff(start, "second");
      setTotalDuration(totalSeconds);

      // Calculate elapsed time in seconds
      const elapsedSeconds = Math.min(now.diff(start, "second"), totalSeconds);
      setTimeElapsed(formatTime(elapsedSeconds));

      // Calculate battery level based on elapsed time (assuming linear charging)
      const calculatedLevel = Math.min(
        ((reservation as any)?.client?.vehicles?.[0]?.variant
          ?.batteryCapacity ?? 0) +
          Math.floor((elapsedSeconds / totalSeconds) * 80), // Start at 20% and charge to 100%
        100
      );
      setBatteryLevel(calculatedLevel);

      // Calculate energy consumed based on battery level and estimated price
      // Assuming estimatedPrice is the total cost for a full charge
      const energyConsumedCalc =
        response.estimatedPrice * (calculatedLevel / 100);
      setEnergyConsumed(energyConsumedCalc);
    } catch (err) {
      setError(err.message || "Failed to load charging session");
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate charging progress
  useEffect(() => {
    if (!startTime || !endTime || totalDuration <= 0) return;

    const interval = setInterval(() => {
      const now = dayjs.utc();
      const elapsedSeconds = Math.min(
        now.diff(startTime, "second"),
        totalDuration
      );

      // Calculate new battery level
      const newLevel = Math.min(
        ((reservation as any)?.client?.vehicles?.[0]?.variant
          ?.batteryCapacity ?? 0) +
          Math.floor((elapsedSeconds / totalDuration) * 80),
        100
      );

      setBatteryLevel(newLevel);
      setTimeElapsed(formatTime(elapsedSeconds));

      // Update energy consumption
      if (reservation) {
        const newEnergyConsumed = reservation.estimatedPrice * (newLevel / 100);
        setEnergyConsumed(newEnergyConsumed);
      }

      // When battery reaches 100%, show completion modal
      if (
        (newLevel === 100 || elapsedSeconds >= totalDuration) &&
        !showCompletionModal
      ) {
        setShowCompletionModal(true);
        handleStopCharging();
        animateModal();
        clearInterval(interval);
      }
    }, 1000); // Update every second for better accuracy

    return () => clearInterval(interval);
  }, [startTime, endTime, totalDuration, reservation, showCompletionModal]);

  const animateModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStopCharging = async () => {
    if (!reservation) return;

    try {
      setLoading(true);

      if (!sessionId) throw new Error("Session ID not found");

      // End the session with the current energy consumption
      await endChargingSession(Number(sessionId), energyConsumed);

      // Show completion modal
      setShowCompletionModal(true);
      animateModal();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to stop charging session");
      console.error("Error stopping session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = () => {
    setShowCompletionModal(false);
    router.replace("/ChargingHistory");
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8c4caf" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSessionData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="battery-dead-outline" size={48} color="#ccc" />
          <Text style={styles.errorText}>No active charging session</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSessionData}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Charging Session</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Circular Progress */}
        <View style={styles.progressSection}>
          <CircularProgress percentage={batteryLevel} />
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionId}>Reservation #{reservation.id}</Text>
          <View style={styles.timeInfo}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Started at</Text>
              <Text style={styles.timeValue}>
                {dayjs.utc(reservation.startsAt).local().format("HH:mm")}
              </Text>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Ends at</Text>
              <Text style={styles.timeValue}>
                {dayjs.utc(reservation.expiresAt).local().format("HH:mm")}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards Grid */}
        <View style={styles.infoGrid}>
          <BatteryCard batteryLevel={batteryLevel} />

          <InfoCard
            icon="time-outline"
            label="Time elapsed"
            value={timeElapsed}
          />

          <InfoCard
            icon="flash"
            label="Energy consumed"
            value={`${energyConsumed.toFixed(1)} kWh`}
            iconColor="#FF9500"
          />

          <InfoCard
            icon="card-outline"
            label="Estimated cost"
            value={`${reservation?.estimatedPrice?.toFixed(2)} TND`}
            iconColor="#8c4caf"
          />
        </View>

        {/* Time Remaining */}
        <View style={styles.timeRemainingContainer}>
          <Ionicons name="alarm-outline" size={20} color="#FF9500" />
          <Text style={styles.timeRemainingText}>
            {calculateTimeRemaining(reservation?.expiresAt)} remaining
          </Text>
        </View>

        {/* Stop Charging Button */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStopCharging}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.stopButtonText}>Stop charging</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.completionIcon}>
              <Ionicons name="battery-charging" size={40} color="#fff" />
            </View>

            <Text style={styles.completionPercentage}>{batteryLevel}%</Text>
            <Text style={styles.completionTitle}>Charging completed</Text>

            <View style={styles.completionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Energy consumed:</Text>
                <Text style={styles.detailValue}>
                  {energyConsumed.toFixed(1)} kWh
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total cost:</Text>
                <Text style={styles.detailValue}>
                  {reservation?.estimatedPrice?.toFixed(2)} TND
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{timeElapsed}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidate}
            >
              <Text style={styles.validateButtonText}>Finish</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Component for circular progress
const CircularProgress = ({ percentage, size = 200 }) => {
  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <View style={styles.circularProgressBackground}>
        <View style={styles.circularProgressInner}>
          <Ionicons name="flash" size={24} color="#FF9500" />
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
      </View>
      <View
        style={[
          styles.progressRing,
          {
            borderColor: percentage === 100 ? "#8c4caf" : "#8c4caf",
            borderWidth: percentage === 100 ? 6 : 4,
          },
        ]}
      />
    </View>
  );
};

// Component for battery card
const BatteryCard = ({ batteryLevel }) => (
  <View style={styles.batteryCard}>
    <View style={styles.batteryContainer}>
      <View style={styles.batteryOuter}>
        <View style={[styles.batteryInner, { height: `${batteryLevel}%` }]} />
      </View>
      <Text style={styles.batteryPercentage}>{batteryLevel}%</Text>
    </View>
    <Text style={styles.batteryLabel}>Battery charged</Text>
    <Text style={styles.batteryValue}>{batteryLevel} %</Text>
  </View>
);

// Component for info card
const InfoCard = ({ icon, label, value, iconColor = "#8c4caf" }) => (
  <View style={styles.infoCard}>
    <Ionicons name={icon} size={20} color={iconColor} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default CurrentChargingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#8c4caf",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 1,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressSection: {
    alignItems: "center",
    marginBottom: 5,
  },
  circularProgress: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  circularProgressBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#2D4A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressInner: {
    alignItems: "center",
  },
  progressRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: "#8c4caf",
    borderStyle: "solid",
    backgroundColor: "transparent",
  },
  percentage: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  sessionInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  timeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeBlock: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  batteryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  batteryOuter: {
    width: 30,
    height: 50,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  batteryInner: {
    backgroundColor: "#8c4caf",
    width: "100%",
    borderRadius: 2,
  },
  batteryPercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8c4caf",
  },
  batteryLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  batteryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    width: "48%",
    marginBottom: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 1,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timeRemainingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  timeRemainingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF9500",
    marginLeft: 8,
  },
  stopButton: {
    backgroundColor: "#8c4caf",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 5,
  },
  stopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "90%",
  },
  completionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8c4caf",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  completionPercentage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8c4caf",
    marginBottom: 5,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8c4caf",
    marginBottom: 10,
  },
  completionDetails: {
    width: "100%",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#757575",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  validateButton: {
    backgroundColor: "#8c4caf",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    minWidth: 120,
  },
  validateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
