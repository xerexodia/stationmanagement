import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const DashLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="VehicleRegisterStep2" />
      <Stack.Screen name="VehicleRegisterStep3" />
      <Stack.Screen name="VehicleRegisterStep5" />
      <Stack.Screen name="LocationPermission" />
      <Stack.Screen name="HomeMap" />
      <Stack.Screen name="Notifications" />
      <Stack.Screen name="Reclamations" />
      <Stack.Screen name="AddReclamation" />
      <Stack.Screen name="ShowProfile" />
      <Stack.Screen name="EditProfile" />
      <Stack.Screen name="StationsList" />
      <Stack.Screen name="StationDetails" />
      <Stack.Screen name="BookingStep1" />
      <Stack.Screen name="BookingStep2" />
      <Stack.Screen name="CurrentCharging" />
      <Stack.Screen name="vehiculeList" />
      <Stack.Screen name="wallet" />
    </Stack>
  );
};

export default DashLayout;

const styles = StyleSheet.create({});
