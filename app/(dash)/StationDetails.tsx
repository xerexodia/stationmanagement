import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSession } from "../../context/UserContext";

const { width } = Dimensions.get("window");

interface StationConfig {
  id: number;
  priceAC: number;
  priceDC: number;
  protocol: string;
}

interface Connector {
  id: number;
  currentType: string;
  power: number;
  price: number;
}

interface ChargePoint {
  id: number;
  coordinates: string;
  region: string;
  availability: boolean;
  connectors: Connector[];
  nconnectors: number;
}

interface Service {
  id: number;
  name: string;
}

interface Station {
  id: number;
  name: string;
  description: string;
  coordinates: string;
  stationConfig: StationConfig;
  chargePoints: ChargePoint[];
  services: Service[];
}

const StationDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Info");
  const [station, setStation] = useState<Station | null>(null);
  console.log("🚀 ~ StationDetailsScreen ~ station:", JSON.stringify(station))
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  const { stationId } = params;

  const tabs = ["Info", "Connectors", "Price", "Services"];

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

        const responseText = await response.text();
        
        if (!responseText) {
          if (response.ok) {
            throw new Error("Station data not available");
          }
          throw new Error("Server returned empty response");
        }

        let parsedData;
        try {
          parsedData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          throw new Error("Invalid server response format");
        }

        if (!response.ok) {
          const errorMessage =
            parsedData.message ||
            parsedData.error ||
            `Server returned status ${response.status}`;
          throw new Error(errorMessage);
        }

        setStation(parsedData?.data);
      } catch (error) {
        console.error("Error fetching station:", error);
        setError(error.message || "Failed to load station details");
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      fetchStationDetails();
    }
  }, [stationId]);

  const handleBookPlace = () => {
    if (!station) return;

    router.push({
      pathname: "/BookingStep1",
      params: {
        stationId: station.id.toString(),
        stationName: station.name,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const getStationStatus = () => {
    if (!station) return "Unknown";
    return station.chargePoints?.some(cp => cp.availability) ? "Available" : "Unavailable";
  };

  const getCoordinatesAddress = (coordinates: string) => {
    if(!coordinates) return "Coordinates not available";
    const [lat, lng] = coordinates?.split(",")?.map(coord => parseFloat(coord.trim()));
    return `Latitude: ${lat?.toFixed(6)}, Longitude: ${lng?.toFixed(6)}`;
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

  const status = getStationStatus();

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

        <Text style={styles.headerTitle}>Station Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require("../../assets/Station.jpeg")}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title}>{station.name}</Text>
          <Text style={styles.address}>
            <Ionicons name="location" size={16} color="#8c4caf" />{" "}
            {getCoordinatesAddress(station.coordinates)}
          </Text>

          <View style={styles.meta}>
            <Text
              style={[
                styles.status,
                status === "Available"
                  ? styles.availableStatus
                  : styles.unavailableStatus,
              ]}
            >
              {status}
            </Text>
            <View style={styles.metaItem}>
              <Ionicons name="flash" size={14} color="#666" />
              <Text style={styles.metaText}>
                Protocol: {station?.stationConfig?.protocol}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag" size={14} color="#666" />
              <Text style={styles.metaText}>
                AC: {station?.stationConfig?.priceAC} DT/kWh
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag" size={14} color="#666" />
              <Text style={styles.metaText}>
                DC: {station?.stationConfig?.priceDC} DT/kWh
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlinedBtn}>
              <Ionicons name="navigate" size={16} color="#8c4caf" />
              <Text style={styles.outlinedBtnText}>Get direction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filledBtn,
                status !== "Available" && styles.disabledButton,
              ]}
              onPress={handleBookPlace}
              disabled={status !== "Available"}
            >
              <Ionicons name="calendar" size={16} color="#fff" />
              <Text style={styles.filledBtnText}>Book a place</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {tabs?.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "Info" && (
              <View>
                <Text style={styles.infoText}>{station.description}</Text>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionSubtitle}>Station Configuration</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Protocol:</Text>
                    <Text style={styles.infoValue}>{station?.stationConfig?.protocol}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>AC Price:</Text>
                    <Text style={styles.infoValue}>{station?.stationConfig?.priceAC} DT/kWh</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>DC Price:</Text>
                    <Text style={styles.infoValue}>{station?.stationConfig?.priceDC} DT/kWh</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === "Connectors" && (
              <View>
                {station?.chargePoints?.map((chargePoint) => (
                  <View key={`cp-${chargePoint.id}`} style={styles.chargePointSection}>
                    <Text style={styles.chargePointTitle}>
                      Charge Point #{chargePoint.id} ({chargePoint.region})
                    </Text>
                    <Text style={styles.availabilityText}>
                      Status: {chargePoint.availability ? "Available" : "Unavailable"}
                    </Text>
                    {chargePoint?.connectors?.map((connector) => (
                      <View
                        key={`connector-${connector.id}`}
                        style={[
                          styles.connectorCard,
                          {
                            borderLeftColor: chargePoint.availability
                              ? "#8c4caf"
                              : "#F44336",
                            opacity: chargePoint.availability ? 1 : 0.7,
                          },
                        ]}
                      >
                        <Ionicons
                          name="flash-outline"
                          size={28}
                          color={chargePoint.availability ? "#8c4caf" : "#666"}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.connectorTitle}>
                            {connector.power} KW
                          </Text>
                          <Text style={styles.connectorType}>
                            {connector.currentType}
                          </Text>
                          <Text style={styles.connectorPrice}>
                            {connector.price} DT/kWh
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: chargePoint.availability ? "#8c4caf" : "#F44336",
                            fontWeight: "600",
                          }}
                        >
                          {chargePoint.availability ? "Available" : "Unavailable"}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {activeTab === "Price" && (
              <View>
                <View style={styles.priceTable}>
                  <View style={styles.priceTableHeader}>
                    <Text style={styles.priceTableHeaderText}>Type</Text>
                    <Text style={styles.priceTableHeaderText}>Power</Text>
                    <Text style={styles.priceTableHeaderText}>Price</Text>
                  </View>
                  {station?.chargePoints?.flatMap(cp =>
                    cp?.connectors?.map(connector => (
                      <View key={`price-${connector.id}`} style={styles.priceTableRow}>
                        <Text style={styles.priceTableCell}>{connector.currentType}</Text>
                        <Text style={styles.priceTableCell}>{connector.power} KW</Text>
                        <Text style={styles.priceTableCell}>{connector.price} DT/kWh</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {activeTab === "Services" && (
              <View>
                {station?.services?.length > 0 ? (
                  station?.services?.map(service => (
                    <View key={`service-${service.id}`} style={styles.serviceCard}>
                      <Ionicons name="checkmark-circle" size={24} color="#8c4caf" />
                      <Text style={styles.serviceName}>{service.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoText}>No services available at this station</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.filledBtnFull,
            status !== "Available" && styles.disabledButton,
          ]}
          onPress={handleBookPlace}
          disabled={status !== "Available"}
        >
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.filledBtnText}>Book a place</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  scrollContainer: { paddingBottom: 100 },
  image: {
    width: width,
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#000", marginBottom: 4 },
  address: { fontSize: 14, color: "#555", marginBottom: 12 },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
  },
  availableStatus: {
    backgroundColor: "#E8F5E8",
    color: "#8c4caf",
  },
  unavailableStatus: {
    backgroundColor: "#FFEBEE",
    color: "#F44336",
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#666" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 25,
  },
  outlinedBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#8c4caf",
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
  },
  outlinedBtnText: { color: "#8c4caf", fontWeight: "600" },
  filledBtn: {
    flex: 1,
    backgroundColor: "#8c4caf",
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
  },
  filledBtnText: { color: "#fff", fontWeight: "600" },
  disabledButton: {
    backgroundColor: "#8c4caf73",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 16,
  },
  tabItem: {
    paddingVertical: 10,
    flex: 1,
    alignItems: "center",
  },
  tabText: { color: "#999", fontSize: 14 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#8c4caf" },
  activeTabText: { color: "#8c4caf", fontWeight: "600" },
  tabContent: { paddingBottom: 30 },
  infoText: { fontSize: 14, color: "#333", lineHeight: 22, marginBottom: 10 },
  infoSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8c4caf",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  filledBtnFull: {
    backgroundColor: "#8c4caf",
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
  },
  chargePointSection: {
    marginBottom: 20,
  },
  chargePointTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  connectorCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  connectorTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  connectorType: { fontSize: 14, color: "#888", marginBottom: 4 },
  connectorPrice: {
    fontSize: 14,
    color: "#8c4caf",
    fontWeight: "600",
  },
  priceTable: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  priceTableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  priceTableHeaderText: {
    flex: 1,
    fontWeight: "600",
    color: "#333",
  },
  priceTableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  priceTableCell: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
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

export default StationDetailsScreen;