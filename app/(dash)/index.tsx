import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSession } from "../../context/UserContext";
import { Ionicons } from "@expo/vector-icons";

export interface Brand {
  id: number;
  name: string;
  status: string;
  models: Model[];
}

export interface Model {
  id: number;
  name: string;
  variants: Variant[];
}

export interface Variant {
  id: number;
  name: string;
  year: number;
  batteryCapacity: number;
  chargingSpeed: number;
  maxRange: number;
  plugType: string;
  currentType: string;
  power: number;
}

const VehicleRegisterStep1 = () => {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: 1,
      status: "APPROVED",
      name: "Tesla",
      models: [
        {
          id: 1,
          name: "Model 3",
          variants: [
            {
              id: 1,
              name: "Long Range AWD",
              batteryCapacity: 82,
              chargingSpeed: 250,
              maxRange: 580,
              plugType: "CCS",
              currentType: "DC",
              year: 2023,
              power: 490,
            },
          ],
        },
        {
          id: 2,
          name: "Model 4",
          variants: [],
        },
      ],
    },
    {
      id: 2,
      status: "APPROVED",
      name: "BMW",
      models: [
        {
          id: 3,
          name: "i4",
          variants: [
            {
              id: 2,
              name: "eDrive40",
              batteryCapacity: 81,
              chargingSpeed: 205,
              maxRange: 590,
              plugType: "Type 2",
              currentType: "AC",
              year: 2022,
              power: 340,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      status: "APPROVED",
      name: "Volkswagen",
      models: [
        {
          id: 4,
          name: "ID.4",
          variants: [
            {
              id: 5,
              name: "Pro Performance",
              batteryCapacity: 77,
              chargingSpeed: 135,
              maxRange: 522,
              plugType: "CCS",
              currentType: "DC",
              year: 2023,
              power: 204,
            },
          ],
        },
        {
          id: 10,
          name: "dtrdr",
          variants: [],
        },
      ],
    },
    {
      id: 4,
      status: "APPROVED",
      name: "Hyundai",
      models: [
        {
          id: 5,
          name: "Kona Electric",
          variants: [
            {
              id: 6,
              name: "64 kWh",
              batteryCapacity: 64,
              chargingSpeed: 100,
              maxRange: 484,
              plugType: "Type 2",
              currentType: "AC",
              year: 2021,
              power: 204,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      status: "APPROVED",
      name: "Renault",
      models: [
        {
          id: 6,
          name: "ZOE",
          variants: [
            {
              id: 7,
              name: "R135",
              batteryCapacity: 52,
              chargingSpeed: 50,
              maxRange: 395,
              plugType: "Type 2",
              currentType: "AC",
              year: 2021,
              power: 135,
            },
          ],
        },
      ],
    },
    {
      id: 10,
      status: "PENDING",
      name: "test",
      models: [],
    },
    {
      id: 11,
      status: "APPROVED",
      name: "test edde",
      models: [],
    },
    {
      id: 12,
      status: "APPROVED",
      name: "ffxytyuhg",
      models: [],
    },
    {
      id: 13,
      status: "APPROVED",
      name: "ef",
      models: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { session, user, addVehicle } = useSession();
  useEffect(() => {
    if (addVehicle) return;
    if (Boolean(user?.vehicleCount)) {
      router.push("/LocationPermission");
    }
  }, [user.vehicleCount]);
  useEffect(() => {
    fetchBrands();
  }, [session]);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/brands`,
        {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data = await response.json();
      if (data.success && data.data) {
        const approvedBrands = data.data;
        setBrands(approvedBrands);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSelect = (brandId: number) => {
    setSelectedBrand(brandId);
  };

  const handleNext = () => {
    if (selectedBrand) {
      router.push({
        pathname: "/VehicleRegisterStep2",
        params: {
          selectedBrand: selectedBrand.toString(),
          brandsData: JSON.stringify(
            brands?.find((el) => el.id === selectedBrand)
          ),
        },
      });
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      Alert.alert("Error", "Please enter a brand name");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/brands`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify({
            name: newBrandName.trim(),
          }),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Failed to add brand");
      }

      await fetchBrands();
      setIsAddModalVisible(false);
      setNewBrandName("");
      Alert.alert("Success", "Brand added successfully!");
    } catch (error) {
      console.log("🚀 ~ handleAddBrand ~ error:", error);
      Alert.alert("Error", error.message || "Failed to add brand");
    } finally {
      setIsAdding(false);
    }
  };

  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5].map((step, index) => (
        <View key={step} style={styles.progressStep}>
          <View
            style={[
              styles.progressDot,
              index === 0 ? styles.activeDot : styles.inactiveDot,
            ]}
          />
          {index < 4 && <View style={styles.progressLine} />}
        </View>
      ))}
    </View>
  );

  const VehicleBrandItem = ({ brand, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.brandItem, isSelected && styles.selectedBrandItem]}
      onPress={() => onSelect(brand.id)}
      activeOpacity={0.7}
    >
      <View style={styles.brandContent}>
        <View style={styles.brandIcon}>
          <Text style={styles.iconText}>🚗</Text>
        </View>
        <Text style={styles.brandName}>{brand.name}</Text>
      </View>
      <View style={styles.radioButton}>
        <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8c4caf" />
      </SafeAreaView>
    );
  }

  //   if (error) {
  //     return (
  //       <SafeAreaView style={styles.container}>
  //         <Text style={styles.errorText}>{error}</Text>
  //         <TouchableOpacity style={styles.retryButton} onPress={fetchBrands}>
  //           <Text style={styles.retryButtonText}>Retry</Text>
  //         </TouchableOpacity>
  //       </SafeAreaView>
  //     );
  //   }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Step Info */}
      <View style={styles.stepInfo}>
        <Text style={styles.stepLabel}>STEP 1</Text>
        <Text style={styles.stepTitle}>Choose your vehicle brand</Text>
      </View>

      {/* Vehicle Brands List */}
      <ScrollView
        style={styles.brandsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          brands.length === 0 ? styles.emptyContainer : null
        }
      >
        {brands.length > 0 ? (
          brands.map((brand) => (
            <VehicleBrandItem
              key={brand.id}
              brand={brand}
              isSelected={selectedBrand === brand.id}
              onSelect={handleBrandSelect}
            />
          ))
        ) : (
          <View style={styles.emptyMessageContainer}>
            <Ionicons name="car-outline" size={48} color="#ccc" />
            <Text style={styles.emptyMessageText}>No vehicle brands found</Text>
            <Text style={styles.emptySubText}>
              Add a new brand to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Vehicle Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#8c4caf" />
        <Text style={styles.addButtonText}>Add Vehicle Brand</Text>
      </TouchableOpacity>

      {/* Next Button */}
      {selectedBrand && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Brand Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isAdding && setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Vehicle Brand</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter brand name"
              value={newBrandName}
              onChangeText={setNewBrandName}
              placeholderTextColor="#999"
              editable={!isAdding}
              maxLength={50}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddModalVisible(false)}
                disabled={isAdding}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  isAdding && styles.disabledButton,
                ]}
                onPress={handleAddBrand}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#8c4caf",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyMessageContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyMessageText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginVertical: 20,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeDot: {
    backgroundColor: "#333",
  },
  inactiveDot: {
    backgroundColor: "#E5E5E5",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 8,
  },
  stepInfo: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    lineHeight: 30,
  },
  brandsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  brandItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedBrandItem: {
    backgroundColor: "#F0F8FF",
    borderColor: "#007AFF",
  },
  brandContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  radioButton: {
    padding: 5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#007AFF",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  nextButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8c4caf",
    borderStyle: "dashed",
  },
  addButtonText: {
    color: "#8c4caf",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  submitButton: {
    backgroundColor: "#8c4caf",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // ... (keep all your existing styles)
});

export default VehicleRegisterStep1;
