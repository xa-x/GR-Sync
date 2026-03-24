import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#000" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "GR Sync" }} />
        <Stack.Screen name="library" options={{ title: "Library" }} />
        <Stack.Screen name="import" options={{ title: "Import" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </View>
  );
}
