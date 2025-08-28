import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSession } from "../../context/UserContext";

interface VehicleData {
  brand: string;
  model: string;
  version: string;
  plugType: string;
  currentType: string;
  batteryCapacity: number;
  chargingSpeed: number;
  maxRange: number;
  power: number;
}

const VehicleRegisterStep5 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const { session, user,signIn,setAddVehicle } = useSession();

  useEffect(() => {
    if (
      params.brandsData &&
      params.selectedBrand &&
      params.selectedModel &&
      params.selectedVersion
    ) {
      try {
        const parsedBrands = JSON.parse(params.brandsData as string);
        const selectedModelId = Number(params.selectedModel);
        const selectedVersionId = Number(params.selectedVersion);

        const brand = parsedBrands;
        const model = brand?.models?.find((m: any) => m.id === selectedModelId);
        const variant = model?.variants?.find(
          (v: any) => v.id === selectedVersionId
        );

        if (variant) {
          setVehicleData({
            brand: brand?.name || "Unknown Brand",
            model: model?.name || "Unknown Model",
            version: variant.name,
            plugType: variant.plugType,
            currentType: variant.currentType,
            batteryCapacity: variant.batteryCapacity,
            chargingSpeed: variant.chargingSpeed,
            maxRange: variant.maxRange,
            power: variant.power,
          });
        }
      } catch (error) {
        console.error("Error parsing vehicle data:", error);
      }
    }
  }, [
    params.brandsData,
    params.selectedBrand,
    params.selectedModel,
    params.selectedVersion,
  ]);

  const handleConfirm = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}client/vehicles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify({
            ClientId: user.id,
            VariantId: params.selectedVersion, 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add vehicle");
      }

      const data = await response.json();
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };
  
  const handleContinue = () => {
    setAddVehicle(false)
    setShowSuccessModal(false);
    signIn(session)
  };

  const handleEdit = () => {
    router.back();
  };

  if (!vehicleData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading vehicle data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {showSuccessModal && <View style={styles.blurOverlay} />}

      <View style={[styles.header, showSuccessModal && styles.blurredContent]}>
        <TouchableOpacity style={styles.backButton} onPress={handleEdit}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.progressContainer,
          showSuccessModal && styles.blurredContent,
        ]}
      >
        {[1, 2, 3, 4, 5].map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                index < 4
                  ? styles.activeDot
                  : index === 4
                  ? styles.currentDot
                  : styles.inactiveDot,
              ]}
            />
            {index < 4 && <View style={styles.progressLine} />}
          </View>
        ))}
      </View>

      <View
        style={[styles.stepInfo, showSuccessModal && styles.blurredContent]}
      >
        <Text style={styles.stepLabel}>STEP 5</Text>
        <Text style={styles.stepTitle}>Recapitulation</Text>
      </View>

      <Text
        style={[styles.sectionLabel, showSuccessModal && styles.blurredContent]}
      >
        Vehicle
      </Text>
      <View
        style={[styles.vehicleCard, showSuccessModal && styles.blurredContent]}
      >
        <View style={styles.vehicleIcon}>
          <Ionicons name="car" size={24} color="#FF8C00" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleBrand}>{vehicleData.brand}</Text>
          <Text style={styles.vehicleDetails}>
            {vehicleData.model} - {vehicleData.version}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.sectionLabel, showSuccessModal && styles.blurredContent]}
      >
        Properties
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.propertiesContainer,
            showSuccessModal && styles.blurredContent,
          ]}
        >
          <View style={styles.propertyCard}>
            <View style={styles.propertyIcon}>
              <Ionicons name="flash" size={20} color="#666" />
            </View>
            <Text style={styles.propertyText}>
              {vehicleData.plugType} ({vehicleData.currentType})
            </Text>
          </View>

          <View style={styles.propertyCard}>
            <View style={styles.propertyIcon}>
              <Ionicons name="battery-charging" size={20} color="#666" />
            </View>
            <Text style={styles.propertyText}>
              {vehicleData.batteryCapacity} kWh
            </Text>
          </View>

          <View style={styles.propertyCard}>
            <View style={styles.propertyIcon}>
              <Ionicons name="speedometer" size={20} color="#666" />
            </View>
            <Text style={styles.propertyText}>
              {vehicleData.chargingSpeed} kW max charging
            </Text>
          </View>

          <View style={styles.propertyCard}>
            <View style={styles.propertyIcon}>
              <Ionicons name="map" size={20} color="#666" />
            </View>
            <Text style={styles.propertyText}>
              {vehicleData.maxRange} km range
            </Text>
          </View>

          <View style={styles.propertyCard}>
            <View style={styles.propertyIcon}>
              <Ionicons name="power" size={20} color="#666" />
            </View>
            <Text style={styles.propertyText}>{vehicleData.power} HP</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          showSuccessModal && styles.blurredContent,
        ]}
        onPress={handleConfirm}
      >
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={30} color="#fff" />
            </View>
            <Text style={styles.successTitle}>
              Vehicle Registered Successfully
            </Text>
            <Text style={styles.successSubtitle}>
              You can now start searching for charging stations
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "#000",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
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
    width: 30,
    height: 2,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 6,
  },
  stepInfo: {
    marginBottom: 30,
  },
  stepLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  sectionLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 15,
    marginTop: 20,
  },
  vehicleCard: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#FFE4B5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: "#888",
  },
  propertiesContainer: {
    gap: 12,
  },
  propertyCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  propertyIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  propertyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  confirmButton: {
    marginTop: 40,
    backgroundColor: "#8c4caf",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  blurredContent: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "90%",
    maxWidth: 350,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#8c4caf",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8c4caf",
    textAlign: "center",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: "#8c4caf",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VehicleRegisterStep5;
