import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "../../context/UserContext";

const { width } = Dimensions.get("window");

const RecapScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session, user } = useSession();

  // Parse the JSON data from params
  const station = params.station ? JSON.parse(params.station as string) : null;
  const chargePoint = params.chargePoint
    ? JSON.parse(params.chargePoint as string)
    : null;
  const connector = params.connector
    ? JSON.parse(params.connector as string)
    : null;

  // Destructure other booking data
  const {
    chargeLevel = "75",
    carBrand = "Toyota",
    carModel = "Model X",
    selectedDate = 5,
    selectedTime = "10:00 - 11:00",
    selectedDuration = "60",
    month = "September",
    year = 2021,
    startsAt,
    expiresAt,
  } = params;

  const chargeLevelNumber = Number(chargeLevel);
  const selectedDurationNumber = Number(selectedDuration);
  const numericYear = Number(year);
  const numericDate = Number(selectedDate);

  const formatDate = () => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(numericYear, getMonthNumber(month) - 1, numericDate);
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${numericDate} ${month} ${numericYear}`;
  };

  const getMonthNumber = (monthName) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.indexOf(monthName) + 1;
  };

  const calculateEstimatedCost = () => {
    if (!connector) return "0.00";
    const durationInHours = selectedDurationNumber / 60;
    return (connector.price * durationInHours).toFixed(2);
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);

    try {
      const reservationData = {
        startsAt: startsAt,
        expiresAt: expiresAt,
      };
      console.log("🚀 ~ handleConfirmBooking ~ reservationData:", reservationData)
      

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/reservations?clientId=${user.id}&connectorId=${connector.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify(reservationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("🚀 ~ handleConfirmBooking ~ result:", result)

      Alert.alert(
        "Booking Confirmed!",
        `Your charging session at ${station.name} has been booked successfully.`,
        [
          {
            text: "Go Home",
            onPress: () => router.push("/HomeMap"),
          },
        ]
      );
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Booking Failed",
        "There was an error processing your booking. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReservation = () => {
    router.back();
  };

  const getChargeIcon = (charge) => "⚡";

  const getChargeColor = (charge) => {
    if (charge >= 70) return "#8c4caf";
    if (charge >= 40) return "#FF9800";
    return "#FF9800";
  };

  const estimatedCost = calculateEstimatedCost();

  if (!station || !chargePoint || !connector) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8c4caf" />
        <Text style={styles.errorText}>Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation Summary</Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.completedStepLabel]}>
            Vehicle
          </Text>
        </View>

        <View style={[styles.progressLine, styles.completedLine]} />

        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.completedStep]}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.completedStepLabel]}>
            Reservation
          </Text>
        </View>

        <View style={[styles.progressLine, styles.completedLine]} />

        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Ionicons name="receipt-outline" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.activeStepLabel]}>Recap</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={24} color="#8c4caf" />
            <Text style={styles.cardHeaderTitle}>Booking Details</Text>
          </View>

          {/* Charging Station */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Charging Station</Text>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={18} color="#666" />
              <Text style={styles.detailText}>{station.name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="flash" size={18} color="#666" />
              <Text style={styles.detailText}>
                Charge Point #{chargePoint.id}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="radio-button-on" size={18} color="#666" />
              <Text style={styles.detailText}>
                {connector.currentType.toUpperCase()} Connector (
                {connector.power} kW)
              </Text>
            </View>
          </View>

          {/* Vehicle */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <View style={styles.detailItem}>
              <Ionicons name="car" size={18} color="#666" />
              <Text style={styles.detailText}>
                {carBrand} - {carModel}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.chargeIcon,
                  { color: getChargeColor(chargeLevelNumber) },
                ]}
              >
                {getChargeIcon(chargeLevelNumber)}
              </Text>
              <Text style={styles.detailText}>
                Target Charge: {chargeLevel}%
              </Text>
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={18} color="#666" />
              <Text style={styles.detailText}>{formatDate()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color="#666" />
              <Text style={styles.detailText}>{selectedTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass" size={18} color="#666" />
              <Text style={styles.detailText}>
                Duration: {selectedDuration} minutes
              </Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag" size={18} color="#666" />
              <Text style={styles.detailText}>
                Rate: {connector.price} DT/kWh
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calculator" size={18} color="#666" />
              <Text style={styles.detailText}>
                Estimated Cost: {estimatedCost} DT
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditReservation}
          disabled={isLoading}
        >
          <Ionicons name="pencil-outline" size={20} color="#8c4caf" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.disabledButton]}
          onPress={handleConfirmBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    backgroundColor: "#000",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginRight: 36,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressStep: {
    alignItems: "center",
    minWidth: 60,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: "#8c4caf",
  },
  completedStep: {
    backgroundColor: "#8c4caf",
  },
  stepLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  activeStepLabel: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  completedStepLabel: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  completedLine: {
    backgroundColor: "#8c4caf",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    flex: 1,
  },
  chargeIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  bottomContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 15,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#8c4caf",
    backgroundColor: "#fff",
    opacity: 1,
  },
  editButtonText: {
    color: "#8c4caf",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  confirmButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
    backgroundColor: "#8c4caf",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default RecapScreen;
