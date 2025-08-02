import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useSession } from "../../context/UserContext";

const LocationPermissionScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const router = useRouter();
  const {user} = useSession()

  useEffect(()=>{
      if(!user?.vehicleCount){
        router.push('/index')
      }
    },[user.vehicleCount])

  // Check permission status on component mount
  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    };
    checkPermission();
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();

      // If permission hasn't been granted, request it
      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        status = newStatus;
        setPermissionStatus(newStatus);
      }

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        router.push({
          pathname: "/HomeMap",
          params: {
            userLocation: JSON.stringify({ latitude, longitude }),
          },
        });
      } else {
        if (status === "denied") {
          Alert.alert(
            "Permission Required",
            "Location permission is required to find nearby stations. Please enable it in your device settings.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Open Settings",
                // onPress: () => Location.(),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert(
        "Error",
        "Failed to get location. Please make sure location services are enabled and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity style={{
        padding:10,
        backgroundColor:"black",
        width:40,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        margin:10

      }} onPress={()=>router.push('/HomeMap')}>
        <Ionicons name="close" size={20} color={"white"}/>
      </TouchableOpacity>
      <View style={styles.illustrationContainer}>
        <View style={styles.mapBackground}>
          <View style={styles.locationPin}>
            <Ionicons name="location" size={32} color="#fff" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          We need to know your location to suggest nearby stations
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleUseCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" style={styles.buttonIcon} />
            ) : (
              <Ionicons
                name="locate"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
            )}
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Getting Location..." : "Use Current Location"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LocationPermissionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: "#000",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  mapBackground: {
    width: 200,
    height: 200,
    backgroundColor: "#E8F5E8",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  locationPin: {
    width: 60,
    height: 60,
    backgroundColor: "#8c4caf",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8c4caf",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "left",
    lineHeight: 32,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#8c4caf",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8c4caf",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#8c4caf",
    fontSize: 16,
    fontWeight: "600",
  },
});
