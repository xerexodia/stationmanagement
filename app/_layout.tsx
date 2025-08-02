// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { SessionProvider, useSession } from "../context/UserContext";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Root />
      <StatusBar style="auto" />
    </SessionProvider>
  );
}

function Root() {
  const { user, isLoading } = useSession();
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size={40} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      >
        <Stack.Protected guard={Boolean(user)}>
          <Stack.Screen name="(dash)" />
          <Stack.Screen name="+not-found" />
        </Stack.Protected>
        <Stack.Protected guard={!Boolean(user)}>
          <Stack.Screen name="login" />
          <Stack.Screen name="EmailLogin" />
          <Stack.Screen name="Signup" />
          <Stack.Screen name="ResetPswd" />
          <Stack.Screen name="+not-found" />
        </Stack.Protected>
      </Stack>
    </SafeAreaView>
  );
}
