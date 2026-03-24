import { View, Text, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { useCamera } from "@/hooks/useCamera";

export default function SettingsScreen() {
  const { connection, disconnect } = useCamera();
  const [preferWifi, setPreferWifi] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);

  return (
    <View className="flex-1 bg-black px-4">
      {/* Connection Status */}
      <View className="py-4 border-b border-white/10">
        <Text className="text-white/50 text-xs uppercase tracking-wider mb-3">
          Connection
        </Text>
        
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-white">Status</Text>
          <Text className={connection.isConnected ? "text-green-400" : "text-white/50"}>
            {connection.isConnected ? "Connected" : "Disconnected"}
          </Text>
        </View>

        {connection.isConnected && (
          <>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-white">Camera</Text>
              <Text className="text-white/50">{connection.cameraName}</Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-white">Method</Text>
              <Text className="text-white/50 uppercase">{connection.method}</Text>
            </View>
            {connection.ipAddress && (
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-white">IP Address</Text>
                <Text className="text-white/50">{connection.ipAddress}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Preferences */}
      <View className="py-4 border-b border-white/10">
        <Text className="text-white/50 text-xs uppercase tracking-wider mb-3">
          Preferences
        </Text>
        
        <View className="flex-row justify-between items-center py-3">
          <View>
            <Text className="text-white">Prefer WiFi</Text>
            <Text className="text-white/40 text-sm">Faster transfers</Text>
          </View>
          <Switch
            value={preferWifi}
            onValueChange={setPreferWifi}
            trackColor={{ false: "#333", true: "#3b82f6" }}
          />
        </View>

        <View className="flex-row justify-between items-center py-3">
          <View>
            <Text className="text-white">Auto-connect</Text>
            <Text className="text-white/40 text-sm">Connect when camera detected</Text>
          </View>
          <Switch
            value={autoConnect}
            onValueChange={setAutoConnect}
            trackColor={{ false: "#333", true: "#3b82f6" }}
          />
        </View>
      </View>

      {/* About */}
      <View className="py-4">
        <Text className="text-white/50 text-xs uppercase tracking-wider mb-3">
          About
        </Text>
        
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-white">Version</Text>
          <Text className="text-white/50">1.0.0</Text>
        </View>
      </View>

      {/* Disconnect Button */}
      {connection.isConnected && (
        <View className="absolute bottom-8 left-4 right-4">
          <TouchableOpacity
            onPress={disconnect}
            className="bg-red-500/20 py-4 rounded-xl"
          >
            <Text className="text-red-400 text-center font-semibold">
              Disconnect
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
