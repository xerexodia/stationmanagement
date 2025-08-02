import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSession } from "../../context/UserContext";

const BookingStep1Screen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { stationId } = params;

  const [selectedChargePoint, setSelectedChargePoint] = useState(null);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [chargeLevel, setChargeLevel] = useState(75);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useSession();

  // Fetch station details when component mounts
  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}client/stations/${stationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch station details");
        }

        const data = await response.json();
        if (data.status === 200 && data.success) {
          setStation(data.data);

          // Find first available charge point with connectors
          const availableChargePoint = data.data.chargePoints.find(
            (cp) => cp.availability && cp.connectors && cp.connectors.length > 0
          );

          if (availableChargePoint) {
            setSelectedChargePoint(availableChargePoint);
            setSelectedConnector(availableChargePoint.connectors[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching station:", error);
        setError("Failed to load station details");
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      fetchStationDetails();
    }
  }, [stationId]);

  const handleContinue = () => {
    if (!station || !selectedChargePoint || !selectedConnector) return;

    const bookingData = {
      station: JSON.stringify(station),
      chargePoint: JSON.stringify(selectedChargePoint),
      connector: JSON.stringify(selectedConnector),
      chargeLevel: chargeLevel,
      carBrand: "Toyota",
      carModel: "Model X",
      carVersion: "Version 2022",
    };

    router.push({
      pathname: "BookingStep2",
      params: bookingData,
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleChargePointSelect = (chargePoint) => {
    setSelectedChargePoint(chargePoint);
    // Auto-select the first connector when charge point changes
    if (chargePoint.connectors && chargePoint.connectors.length > 0) {
      setSelectedConnector(chargePoint.connectors[0]);
    } else {
      setSelectedConnector(null);
    }
  };

  const handleConnectorSelect = (connector) => {
    setSelectedConnector(connector);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8c4caf" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!station) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Station not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reservation</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, styles.activeStep]}>
            <Ionicons name="car" size={16} color="#fff" />
          </View>
          <Text style={[styles.stepLabel, styles.activeStepLabel]}>
            Vehicle
          </Text>
        </View>

        <View style={styles.progressLine} />

        <View style={styles.progressStep}>
          <View style={styles.stepCircle}>
            <Ionicons name="calendar-outline" size={16} color="#ccc" />
          </View>
          <Text style={styles.stepLabel}>Reservation</Text>
        </View>

        <View style={styles.progressLine} />

        <View style={styles.progressStep}>
          <View style={styles.stepCircle}>
            <Ionicons name="receipt-outline" size={16} color="#ccc" />
          </View>
          <Text style={styles.stepLabel}>Summary</Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.content}>
          {/* Station Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={20} color="#8c4caf" />
            <Text style={styles.addressText}>{station.name}</Text>
          </View>

          {/* Confirm your car */}
          <Text style={styles.sectionTitle}>Confirm your car</Text>

          <View style={styles.carCard}>
            <View style={styles.carIcon}>
              <Text style={styles.carIconText}>🚗</Text>
            </View>
            <View style={styles.carInfo}>
              <Text style={styles.carBrand}>Toyota</Text>
              <Text style={styles.carDetails}>Model X Version 2022</Text>
            </View>
            <View style={styles.radioButton}>
              <View style={styles.radioButtonInner} />
            </View>
          </View>

          <TouchableOpacity style={styles.changeCarButton}>
            <Text style={styles.changeCarText}>Change your car</Text>
            <Ionicons name="chevron-down" size={16} color="#8c4caf" />
          </TouchableOpacity>

          {/* Charge Points Selection */}
          <Text style={styles.sectionTitle}>Select Charge Point</Text>

          <View style={styles.chargePointsContainer}>
            {station.chargePoints
              .filter(
                (cp) =>
                  cp.availability && cp.connectors && cp.connectors.length > 0
              )
              .map((chargePoint) => (
                <TouchableOpacity
                  key={chargePoint.id}
                  style={[
                    styles.chargePointCard,
                    selectedChargePoint?.id === chargePoint.id &&
                      styles.selectedChargePointCard,
                  ]}
                  onPress={() => handleChargePointSelect(chargePoint)}
                >
                  <View style={styles.chargePointHeader}>
                    <Ionicons
                      name="flash"
                      size={20}
                      color={
                        selectedChargePoint?.id === chargePoint.id
                          ? "#8c4caf"
                          : "#666"
                      }
                    />
                    <Text
                      style={[
                        styles.chargePointTitle,
                        selectedChargePoint?.id === chargePoint.id &&
                          styles.selectedChargePointText,
                      ]}
                    >
                      Charge Point #{chargePoint.id}
                    </Text>
                  </View>
                  <Text style={styles.chargePointRegion}>
                    {chargePoint.region}
                  </Text>

                  {selectedChargePoint?.id === chargePoint.id && (
                    <View style={styles.connectorsContainer}>
                      <Text style={styles.connectorsTitle}>
                        Available Connectors:
                      </Text>
                      <View style={styles.connectorsList}>
                        {chargePoint.connectors.map((connector) => (
                          <TouchableOpacity
                            key={connector.id}
                            style={[
                              styles.connectorCard,
                              selectedConnector?.id === connector.id &&
                                styles.selectedConnectorCard,
                            ]}
                            onPress={() => handleConnectorSelect(connector)}
                          >
                            <Text
                              style={[
                                styles.connectorType,
                                selectedConnector?.id === connector.id &&
                                  styles.selectedConnectorText,
                              ]}
                            >
                              {connector.currentType.toUpperCase()}
                            </Text>
                            <Text style={styles.connectorPower}>
                              {connector.power} kW
                            </Text>
                            <Text style={styles.connectorPrice}>
                              {connector.price} DT/kWh
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
          </View>

          {/* Charge level needed */}
          <Text style={styles.sectionTitle}>Charge level needed</Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={chargeLevel}
              onValueChange={setChargeLevel}
              minimumTrackTintColor="#8c4caf"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#8c4caf"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>25%</Text>
              <Text style={styles.sliderLabel}>50%</Text>
              <Text style={[styles.sliderLabel, styles.activeSliderLabel]}>
                {Math.round(chargeLevel)}%
              </Text>
              <Text style={styles.sliderLabel}>100%</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedChargePoint || !selectedConnector) &&
              styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedChargePoint || !selectedConnector}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  progressStep: {
    alignItems: "center",
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
  stepLabel: {
    fontSize: 12,
    color: "#999",
  },
  activeStepLabel: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  carCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  carIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#FF9800",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  carIconText: {
    fontSize: 24,
  },
  carInfo: {
    flex: 1,
  },
  carBrand: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  carDetails: {
    fontSize: 14,
    color: "#666",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8c4caf",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8c4caf",
  },
  changeCarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  changeCarText: {
    color: "#8c4caf",
    fontSize: 14,
    marginRight: 5,
  },
  chargePointsContainer: {
    marginBottom: 20,
  },
  chargePointCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedChargePointCard: {
    borderColor: "#8c4caf",
    backgroundColor: "#F1F8E9",
  },
  chargePointHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chargePointTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 10,
  },
  selectedChargePointText: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  chargePointRegion: {
    fontSize: 14,
    color: "#999",
    marginLeft: 30,
  },
  connectorsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  connectorsTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  connectorsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  connectorCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedConnectorCard: {
    borderColor: "#8c4caf",
    backgroundColor: "#E8F5E9",
  },
  connectorType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  selectedConnectorText: {
    color: "#8c4caf",
  },
  connectorPower: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  connectorPrice: {
    fontSize: 12,
    color: "#8c4caf",
    fontWeight: "600",
  },
  sliderContainer: {
    marginBottom: 30,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#999",
  },
  activeSliderLabel: {
    color: "#8c4caf",
    fontWeight: "600",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  continueButton: {
    backgroundColor: "#8c4caf",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8c4caf",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookingStep1Screen;
