import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../context/UserContext";

interface Variant {
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

interface Model {
  id: number;
  name: string;
  variants: Variant[];
}

interface Brand {
  id: number;
  name: string;
  models: Model[];
}

const VehicleRegisterStep3: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    name: "",
    year: new Date().getFullYear(),
    batteryCapacity: 0,
    chargingSpeed: 0,
    maxRange: 0,
    plugType: "Type 2",
    currentType: "AC",
    power: 0,
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const { session } = useSession();

  const { selectedBrand, selectedModel, brandsData } = useLocalSearchParams<{
    selectedBrand: string;
    selectedModel: string;
    brandsData: string;
  }>();

  // Parse the brands data from route params
  const brands: Brand = brandsData ? JSON.parse(brandsData) : [];
  const selectedBrandId = selectedBrand ? parseInt(selectedBrand) : null;
  const selectedModelId = selectedModel ? parseInt(selectedModel) : null;

  // Initialize variants from the selected model
  useEffect(() => {
    if (selectedModelId && brands) {
      const model = brands?.models.find((m) => m.id === selectedModelId);
      setVariants(model?.variants || []);
    }
  }, [selectedBrandId, selectedModelId]);

  const handleVersionSelect = (versionId: number): void => {
    setSelectedVersion(versionId);
  };

  const handleNext = (): void => {
    if (selectedVersion && selectedBrandId && selectedModelId) {
      router.push({
        pathname: "/VehicleRegisterStep5",
        params: {
          selectedBrand: selectedBrandId.toString(),
          selectedModel: selectedModelId.toString(),
          selectedVersion: selectedVersion.toString(),
          brandsData: brandsData,
        },
      });
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.name || !newVariant.year) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!selectedBrandId || !selectedModelId) {
      Alert.alert("Error", "No brand or model selected");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/variants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify({
            ...newVariant,
            model: {
              id: selectedModelId,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add variant");
      }

      // Add the new variant to our local state
      const addedVariant = {
        ...newVariant,
        id: data.data.id, // Assuming the API returns the created variant with ID
      } as Variant;

      setVariants([...variants, addedVariant]);
      setSelectedVersion(addedVariant.id);

      // Reset form and close modal
      setNewVariant({
        name: "",
        year: new Date().getFullYear(),
        batteryCapacity: 0,
        chargingSpeed: 0,
        maxRange: 0,
        plugType: "Type 2",
        currentType: "AC",
        power: 0,
      });
      setIsAddModalVisible(false);

      Alert.alert("Success", "Variant added successfully!");
      router.push('/')
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add variant");
    } finally {
      setIsAdding(false);
    }
  };

  const ProgressIndicator = ({ currentStep }) => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5].map((step, index) => (
        <View key={step} style={styles.progressStep}>
          <View
            style={[
              styles.progressDot,
              index < currentStep
                ? styles.activeDot
                : index === currentStep
                ? styles.currentDot
                : styles.inactiveDot,
            ]}
          />
          {index < 4 && <View style={styles.progressLine} />}
        </View>
      ))}
    </View>
  );

  const VehicleVersionItem = ({ version, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.versionItem, isSelected && styles.selectedVersionItem]}
      onPress={() => onSelect(version.id)}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.versionText, isSelected && styles.selectedVersionText]}
      >
        {version.name} ({version.year})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={2} />

      {/* Step Info */}
      <View style={styles.stepInfo}>
        <Text style={styles.stepLabel}>STEP 3</Text>
        <Text style={styles.stepTitle}>Choose your vehicle version</Text>
      </View>

      {/* Vehicle Versions Grid */}
      <ScrollView
        contentContainerStyle={styles.versionsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.versionsGrid}>
          {variants.map((version) => (
            <VehicleVersionItem
              key={version.id}
              version={version}
              isSelected={selectedVersion === version.id}
              onSelect={handleVersionSelect}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add Variant Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#8c4caf" />
        <Text style={styles.addButtonText}>Add Variant</Text>
      </TouchableOpacity>

      {/* Next Button */}
      {selectedVersion && (
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

      {/* Add Variant Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isAdding && setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Add New Variant</Text>

              {/* Form Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Variant Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Long Range AWD"
                  value={newVariant.name}
                  onChangeText={(text) =>
                    setNewVariant({ ...newVariant, name: text })
                  }
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Year*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2023"
                  value={newVariant.year?.toString()}
                  onChangeText={(text) =>
                    setNewVariant({ ...newVariant, year: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Battery Capacity (kWh)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 82"
                  value={newVariant.batteryCapacity?.toString()}
                  onChangeText={(text) =>
                    setNewVariant({
                      ...newVariant,
                      batteryCapacity: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Charging Speed (kW)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 250"
                  value={newVariant.chargingSpeed?.toString()}
                  onChangeText={(text) =>
                    setNewVariant({
                      ...newVariant,
                      chargingSpeed: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Max Range (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 580"
                  value={newVariant.maxRange?.toString()}
                  onChangeText={(text) =>
                    setNewVariant({
                      ...newVariant,
                      maxRange: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Plug Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., CCS"
                  value={newVariant.plugType}
                  onChangeText={(text) =>
                    setNewVariant({ ...newVariant, plugType: text })
                  }
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Current Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., DC"
                  value={newVariant.currentType}
                  onChangeText={(text) =>
                    setNewVariant({ ...newVariant, currentType: text })
                  }
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Power (HP)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 490"
                  value={newVariant.power?.toString()}
                  onChangeText={(text) =>
                    setNewVariant({
                      ...newVariant,
                      power: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Buttons */}
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
                  onPress={handleAddVariant}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    backgroundColor: "#8c4caf",
  },
  currentDot: {
    backgroundColor: "#8c4caf",
    borderWidth: 3,
    borderColor: "#E8F5E8",
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
  versionsContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  versionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  versionItem: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedVersionItem: {
    backgroundColor: "#8c4caf",
    borderColor: "#8c4caf",
  },
  versionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectedVersionText: {
    color: "#fff",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWrapper: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  formGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    justifyContent: "center",
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  submitButton: {
    backgroundColor: "#8c4caf",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default VehicleRegisterStep3;
