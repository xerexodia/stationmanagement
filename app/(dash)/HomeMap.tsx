import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Animated,
  Dimensions,
  GestureResponderEvent,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "../../context/UserContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const HomeMapScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const getUserLocation = () => {
    if (!params.userLocation) return null;
    try {
      const locationParam = Array.isArray(params.userLocation)
        ? params.userLocation[0]
        : params.userLocation;
      return JSON.parse(locationParam);
    } catch (error) {
      console.warn("Failed to parse userLocation:", error);
      return null;
    }
  };

  const userLocation = getUserLocation();

  const [searchText, setSearchText] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showStationModal, setShowStationModal] = useState(false);
  const [gasStations, setGasStations] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const mapRef = useRef(null);
  const [selectedVehicle, setSelectedVehicle] = useState("Toyota Corolla");
  const { session } = useSession();

  const fetchStations = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/stations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stations");
      }

      const data = await response.json();
      if (data.status === 200 && data.success) {
        const transformedStations = data.data.map((station) => ({
          id: station.id,
          name: station.name,
          address: station.description,
          coordinates: {
            latitude: station.coordinates.split(",")[0],
            longitude: station.coordinates.split(",")[1],
          },
          status: station.chargePoints.some((cp) => cp.availability)
            ? "Available"
            : "Unavailable",
          rating: 4.5,
          reviews: 100,
          distance: station.distance,
          timeAway: "5 mins",
          chargerTypes: station.chargePoints.reduce((acc, cp) => {
            return acc + cp.connectors.length;
          }, 0),
          originalData: station,
          latitude: parseFloat(station.coordinates.split(",")[0].trim()),
          longitude: parseFloat(station.coordinates.split(",")[1].trim()),
        }));

        setGasStations(transformedStations);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  useEffect(() => {
    (async () => {
      let lat = 36.8485;
      let lng = 10.1765;

      if (userLocation?.latitude && userLocation?.longitude) {
        lat = userLocation.latitude;
        lng = userLocation.longitude;
        setCurrentLocation({ latitude: lat, longitude: lng });
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required.");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
        setCurrentLocation({ latitude: lat, longitude: lng });
      }

      const region = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(region);
      fetchStations();

      setTimeout(() => {
        if (mapRef.current) mapRef.current.animateToRegion(region, 1000);
      }, 300);
    })();
  }, []);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCurrentLocation({ latitude, longitude });
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (e) {
      Alert.alert("Error", "Failed to get location");
    }
    setIsLocating(false);
  };

  const handleMarkerPress = (station) => {
    setSelectedStation(station);
    setShowStationModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeStationModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowStationModal(false);
      setSelectedStation(null);
    });
  };

  // Fixed function - removed the error throw
  const handleBookPlace = (): void => {
    // Close the modal first
    closeStationModal();
    router.push({
      pathname: "/BookingStep1",
      params: { stationId: selectedStation.id },
    });
  };

  // Fixed function - removed the error throw
  const handleViewStation = (): void => {
    // Close the modal first
    closeStationModal();

    // Navigate to station details
    router.push({
      pathname: "/StationDetails",
      params: { stationId: selectedStation.id },
    });
  };

  if (!mapRegion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Loading map...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>LOGO</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/StationsList")}
        >
          <Ionicons name="search" size={18} color="#666" />
          <Text style={styles.searchInput}>Search location...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#8c4caf" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {gasStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            description={station.address}
            onPress={() => handleMarkerPress(station)}
          >
            <View style={[styles.markerContainer, { backgroundColor: "blue" }]}>
              <Ionicons name="car" size={16} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={isLocating}
      >
        <Ionicons
          name={isLocating ? "refresh" : "locate"}
          size={18}
          color="#333"
        />
        <Text style={styles.locationButtonText}>
          {isLocating ? "Locating..." : "Location"}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showStationModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeStationModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeStationModal}
          />
          <Animated.View
            style={[
              styles.stationModal,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Station Info Header */}
            <View style={styles.stationHeader}>
              <View style={styles.stationTitleContainer}>
                <Text style={styles.stationName}>{selectedStation?.name}</Text>
                <TouchableOpacity style={styles.directionsButton}>
                  <Ionicons name="navigate" size={20} color="#8c4caf" />
                </TouchableOpacity>
              </View>

              <View style={styles.stationAddressContainer}>
                <Ionicons name="location-outline" size={16} color="#8c4caf" />
                <Text style={styles.stationAddress}>
                  {selectedStation?.address}
                </Text>
              </View>

              {/* Station Stats */}
              <View style={styles.stationStats}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {selectedStation?.status}
                  </Text>
                </View>

                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {selectedStation?.rating} ({selectedStation?.reviews}{" "}
                    reviews)
                  </Text>
                </View>

                <View style={styles.distanceContainer}>
                  <Ionicons name="car-outline" size={14} color="#666" />
                  <Text style={styles.distanceText}>
                    {selectedStation?.distance}
                  </Text>
                </View>

                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.timeText}>
                    {selectedStation?.timeAway}
                  </Text>
                </View>
              </View>

              {/* Charger Types */}
              <View style={styles.chargerSection}>
                <View style={styles.chargerIcons}>
                  <View style={styles.chargerIcon}>
                    <Ionicons name="battery-charging" size={20} color="#666" />
                  </View>
                  <View style={styles.chargerIcon}>
                    <Ionicons name="flash" size={20} color="#666" />
                  </View>
                  <View style={styles.chargerIcon}>
                    <Ionicons name="car-sport" size={20} color="#666" />
                  </View>
                </View>
                <TouchableOpacity style={styles.chargerTypesButton}>
                  <Text style={styles.chargerTypesText}>
                    {selectedStation?.chargerTypes} types of chargers
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#8c4caf" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.viewStationButton}
                  onPress={handleViewStation}
                >
                  <Text style={styles.viewStationText}>View Station</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookPlace}
                >
                  <Text style={styles.bookButtonText}>Book a place</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome5 name="gas-pump" size={24} color="#8c4caf" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Reclamations")}
        >
          <Ionicons name="flash" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/Notifications")}
        >
          <Ionicons name="notifications" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ShowProfile")}
        >
          <Ionicons name="person" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  logoContainer: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoText: {
    color: "#8c4caf",
    fontWeight: "600",
    fontSize: 14,
  },
  vehicleSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  vehicleText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  debugInfo: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "#f0f0f0",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 6,
  },
  locationButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  locatingButton: {
    opacity: 0.7,
  },
  rotatingIcon: {
    transform: [{ rotate: "45deg" }],
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#8c4caf",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  stationModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  stationHeader: {
    padding: 20,
  },
  stationTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  stationName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  directionsButton: {
    width: 40,
    height: 40,
    backgroundColor: "#E8F5E8",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stationAddressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    gap: 8,
  },
  stationAddress: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    lineHeight: 20,
  },
  stationStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#8c4caf",
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  chargerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  chargerIcons: {
    flexDirection: "row",
    gap: 10,
  },
  chargerIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chargerTypesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chargerTypesText: {
    fontSize: 14,
    color: "#8c4caf",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
  },
  viewStationButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#8c4caf",
    alignItems: "center",
    justifyContent: "center",
  },
  viewStationText: {
    fontSize: 16,
    color: "#8c4caf",
    fontWeight: "600",
  },
  bookButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#8c4caf",
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeNavItem: {
    width: 40,
    height: 40,
    backgroundColor: "#E8F5E8",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  centerNavItem: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeMapScreen;
