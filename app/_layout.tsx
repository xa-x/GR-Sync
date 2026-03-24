import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { CameraProvider } from "@/context/CameraContext";

export default function RootLayout() {
  return (
    <CameraProvider>
      <View className="flex-1 bg-black">
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#000" },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              title: "Settings",
              presentation: "modal",
              headerStyle: { backgroundColor: "#000" },
              headerTintColor: "#fff",
            }}
          />
        </Stack>
      </View>
    </CameraProvider>
  );
}
