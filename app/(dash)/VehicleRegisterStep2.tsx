import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../context/UserContext";
import { Brand } from ".";

const VehicleRegisterStep2: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { session } = useSession();
  
  const { selectedBrand, brandsData } = useLocalSearchParams<{
    selectedBrand: string;
    brandsData: string;
  }>();

  const brands: Brand = brandsData ? JSON.parse(brandsData) : {};
  const selectedBrandId = selectedBrand ? parseInt(selectedBrand) : null;

  const filteredModels =
    brands?.models?.filter((model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleModelSelect = (modelId: number): void => {
    setSelectedModel(modelId);
  };

  const handleNext = (): void => {
    if (selectedModel && selectedBrandId) {
      router.push({
        pathname: "/VehicleRegisterStep3",
        params: {
          selectedBrand: selectedBrandId.toString(),
          selectedModel: selectedModel.toString(),
          brandsData: brandsData,
        },
      });
    }
  };

  const handleAddModel = async () => {
    if (!newModelName.trim()) {
      Alert.alert("Error", "Please enter a model name");
      return;
    }

    if (!selectedBrandId) {
      Alert.alert("Error", "No brand selected");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/models`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify({
            name: newModelName,
            brand: {
              id: selectedBrandId,
            },
          }),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Failed to add model");
      }

      

      setIsAddModalVisible(false);
      setNewModelName("");
      router.push("/");
      Alert.alert("Success", "Model added successfully!");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add model");
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

  const VehicleModelItem = ({ model, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.brandItem, isSelected && styles.selectedBrandItem]}
      onPress={() => onSelect(model.id)}
      activeOpacity={0.7}
    >
      <View style={styles.brandContent}>
        <Text style={styles.brandName}>{model.name}</Text>
      </View>
      <View style={styles.radioButton}>
        <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
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
      <ProgressIndicator currentStep={1} />

      {/* Step Info */}
      <View style={styles.stepInfo}>
        <Text style={styles.stepLabel}>STEP 2</Text>
        <Text style={styles.stepTitle}>Choose your vehicle model</Text>
        {brands && (
          <Text style={styles.brandNameText}>Brand: {brands.name}</Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search models"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Vehicle Models List */}
      <ScrollView
        style={styles.brandsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredModels.length === 0 ? styles.emptyContainer : null
        }
      >
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <VehicleModelItem
              key={model.id}
              model={model}
              isSelected={selectedModel === model.id}
              onSelect={handleModelSelect}
            />
          ))
        ) : (
          <View style={styles.emptyMessageContainer}>
            <Ionicons name="car-sport-outline" size={48} color="#ccc" />
            <Text style={styles.emptyMessageText}>No models found</Text>
            <Text style={styles.emptySubText}>
              Add a new model to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Model Button */}
      <View style={styles.addVehicleContainer}>
        <TouchableOpacity
          style={styles.addVehicleButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#8c4caf" />
          <Text style={styles.addVehicleText}>Add Model</Text>
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      {selectedModel && (
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

      {/* Add Model Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isAdding && setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Model</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter model name"
              value={newModelName}
              onChangeText={setNewModelName}
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
                onPress={handleAddModel}
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
  brandNameText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  brandsList: {
    flex: 1,
    paddingHorizontal: 20,
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
  addVehicleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addVehicleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9E3CC",
    borderWidth: 2,
    borderColor: "#8c4caf",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addVehicleText: {
    color: "#8c4caf",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
});

export default VehicleRegisterStep2;
