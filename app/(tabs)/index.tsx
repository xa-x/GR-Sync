import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import { useCameraContext } from "@/context/CameraContext";
import { WiFiNetwork } from "@/types";
import { useRouter } from "expo-router";
import { IS_SIMULATOR } from "@/lib/wifi/service";

export default function ConnectScreen() {
  const router = useRouter();
  const {
    connection,
    loading,
    error,
    scanForCameras,
    connectToSSID,
    disconnect,
    availableCameras,
  } = useCameraContext();

  const [scanning, setScanning] = useState(false);
  const [manualSSID, setManualSSID] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    scanOnMount();
  }, []);

  const scanOnMount = async () => {
    setScanning(true);
    await scanForCameras();
    setScanning(false);
  };

  const handleSelectCamera = async (camera: WiFiNetwork) => {
    await connectToSSID(camera.ssid);
  };

  const handleManualConnect = async () => {
    if (!manualSSID.trim()) return;
    await connectToSSID(manualSSID.trim(), manualPassword.trim() || undefined);
    setShowManual(false);
  };

  const renderCamera = ({ item }: { item: WiFiNetwork }) => (
    <TouchableOpacity
      onPress={() => handleSelectCamera(item)}
      className="bg-white/5 border border-white/10 px-4 py-4 rounded-xl mb-2 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-white font-medium">{item.ssid}</Text>
        <Text className="text-white/40 text-sm mt-0.5">
          Signal: {item.strength > -50 ? "Strong" : item.strength > -70 ? "Medium" : "Weak"}
        </Text>
      </View>
      <Text className="text-white/30 text-xl">›</Text>
    </TouchableOpacity>
  );

  if (connection.isConnected) {
    return (
      <View className="flex-1 bg-black px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-green-500/20 items-center justify-center mb-4">
            <Text className="text-3xl">📷</Text>
          </View>
          <Text className="text-white text-2xl font-semibold">GR Sync</Text>
          <Text className="text-white/50 text-sm mt-1">Connected</Text>
        </View>

        <View className="bg-green-500/20 px-4 py-4 rounded-xl mb-6 w-full">
          <Text className="text-green-400 text-center font-medium">
            ✓ {connection.cameraName}
          </Text>
          {connection.ipAddress && (
            <Text className="text-green-400/60 text-center text-sm mt-1">
              via WiFi · {connection.ipAddress}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/browse")}
          className="bg-white px-8 py-4 rounded-xl w-full mb-3"
        >
          <Text className="text-black text-center font-semibold text-lg">
            Browse Library
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={disconnect}
          className="bg-red-500/20 px-8 py-4 rounded-xl w-full"
        >
          <Text className="text-red-400 text-center font-semibold">
            Disconnect
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-6">
      {/* Header */}
      <View className="items-center py-8">
        <View className="w-20 h-20 rounded-2xl bg-white/10 items-center justify-center mb-4">
          <Text className="text-3xl">📷</Text>
        </View>
        <Text className="text-white text-2xl font-semibold">GR Sync</Text>
        <Text className="text-white/50 text-sm mt-1 text-center">
          Connect to your Ricoh GR camera{"\n"}to sync photos and videos
        </Text>
      </View>

      {/* Simulator warning */}
      {IS_SIMULATOR && (
        <View className="bg-yellow-500/20 px-4 py-3 rounded-xl mb-4">
          <Text className="text-yellow-400 text-center text-sm font-medium">
            ⚠️ Simulator Detected
          </Text>
          <Text className="text-yellow-400/70 text-center text-xs mt-1">
            WiFi operations require a physical device. The simulator has no WiFi hardware.
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View className="bg-red-500/20 px-4 py-3 rounded-xl mb-4">
          <Text className="text-red-400 text-center text-sm">{error}</Text>
        </View>
      )}

      {/* Scanning indicator */}
      {scanning && (
        <View className="items-center py-4">
          <ActivityIndicator color="#fff" />
          <Text className="text-white/50 text-sm mt-2">Scanning for cameras...</Text>
        </View>
      )}

      {/* Camera list */}
      {!scanning && availableCameras.length > 0 && (
        <View className="flex-1">
          <Text className="text-white/50 text-xs uppercase tracking-wider mb-3">
            Available Cameras
          </Text>
          <FlatList
            data={availableCameras}
            renderItem={renderCamera}
            keyExtractor={(item) => item.ssid}
          />
        </View>
      )}

      {/* No cameras found */}
      {!scanning && availableCameras.length === 0 && !showManual && (
        <View className="items-center py-6">
          <Text className="text-white/50 text-center mb-4">
            No Ricoh GR cameras found.{"\n"}
            Make sure your camera's WiFi is enabled.
          </Text>
        </View>
      )}

      {/* Manual connection */}
      {showManual && (
        <View className="flex-1">
          <Text className="text-white/50 text-xs uppercase tracking-wider mb-3">
            Manual Connection
          </Text>
          <TextInput
            value={manualSSID}
            onChangeText={setManualSSID}
            placeholder="Camera SSID (e.g., GR III)"
            placeholderTextColor="#666"
            className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white mb-3"
          />
          <TextInput
            value={manualPassword}
            onChangeText={setManualPassword}
            placeholder="Password (if required)"
            placeholderTextColor="#666"
            secureTextEntry
            className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white mb-3"
          />
          <TouchableOpacity
            onPress={handleManualConnect}
            disabled={loading || !manualSSID.trim()}
            className={`py-4 rounded-xl ${(loading || !manualSSID.trim()) ? "bg-white/20" : "bg-white"}`}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black text-center font-semibold">Connect</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom actions */}
      <View className="py-6">
        <TouchableOpacity
          onPress={scanOnMount}
          disabled={scanning}
          className="bg-white/5 border border-white/10 py-3 rounded-xl mb-3"
        >
          <Text className="text-white text-center font-medium">
            {scanning ? "Scanning..." : "Scan Again"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowManual(!showManual)}
          className="py-3"
        >
          <Text className="text-white/50 text-center text-sm">
            {showManual ? "Cancel" : "Connect Manually"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
