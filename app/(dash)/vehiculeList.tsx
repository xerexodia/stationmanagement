import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../context/UserContext";

export const fetchClientVehicles = async (
  clientId: any,
  token: string
): Promise<any[]> => {
  try {
    if (!clientId || !token) {
      throw new Error("Missing required parameters");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}client/vehicles/client/${clientId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseText = await response.text();

    if (!responseText) {
      if (response.ok) {
        return [];
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

    if (!parsedData || typeof parsedData !== "object") {
      throw new Error("Invalid response data structure");
    }

    if (!response.ok) {
      const errorMessage =
        parsedData.message ||
        parsedData.error ||
        `Server returned status ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!parsedData.data) {
      console.warn("API response missing data field, returning empty array");
      return [];
    }

    return parsedData.data;
  } catch (error) {
    console.error("Error in fetchClientVehicles:", {
      error: error.message,
      clientId,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    });
    throw error;
  }
};

export const deleteVehicle = async (
  vehicleId: number,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}client/vehicles/${vehicleId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete vehicle");
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};
const VehicleListScreen = () => {
  const router = useRouter();
  const { session, user,setAddVehicle } = useSession();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVehicles = async () => {
    try {
      const data = await fetchClientVehicles(user?.id || 0, session);
      console.log("🚀 ~ loadVehicles ~ data:", data);
      setVehicles(data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleDelete = async (vehicleId: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId, session || "");
              setVehicles(vehicles.filter((v) => v.id !== vehicleId));
              Alert.alert("Success", "Vehicle deleted successfully");
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete vehicle");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (vehicle) => {
    router.push({
      pathname: "/edit-vehicle",
      params: { vehicle: JSON.stringify(vehicle) },
    });
  };

  const handleAddVehicle = () => {
    setAddVehicle(true)
    router.push("/");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const renderVehicleItem = ({ item }: { item }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <Ionicons name="car-sport" size={24} color="#8c4caf" />
        <View style={styles.vehicleTitleContainer}>
          <Text style={styles.vehicleTitle}>{item.variant.name}</Text>
          <Text style={styles.vehicleYear}>{item.variant.year}</Text>
        </View>
        <View style={styles.vehicleActions}>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="battery-charging" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.variant.batteryCapacity} kWh
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="speedometer" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.variant.maxRange} km range
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="flash" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.variant.chargingSpeed} kW charging
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8c4caf" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No vehicles registered</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddVehicle}
            >
              <Text style={styles.addButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {vehicles.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddVehicle}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  vehicleYear: {
    fontSize: 14,
    color: "#666",
  },
  vehicleActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  vehicleDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
    color: "#333",
  },
  reservationCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  upcomingReservation: {
    borderLeftWidth: 4,
    borderLeftColor: "#8c4caf",
  },
  inProgressReservation: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  canceledReservation: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
    opacity: 0.7,
  },
  reservationDate: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  reservationStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  reservationPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8c4caf",
  },
  noReservations: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#8c4caf",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8c4caf",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default VehicleListScreen;
