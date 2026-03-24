import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCameraContext } from "@/context/CameraContext";
import { useRouter } from "expo-router";

export default function ConnectScreen() {
  const router = useRouter();
  const { connection, loading, error, connect, disconnect } = useCameraContext();

  const handleConnect = async () => {
    await connect();
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-2xl bg-white/10 items-center justify-center mb-4">
          <Text className="text-3xl">📷</Text>
        </View>
        <Text className="text-white text-2xl font-semibold">GR Sync</Text>
        <Text className="text-white/50 text-sm mt-1">
          Sync photos from your Ricoh GR
        </Text>
      </View>

      {connection.isConnected ? (
        <View className="items-center">
          <View className="bg-green-500/20 px-4 py-3 rounded-xl mb-6 w-full">
            <Text className="text-green-400 text-center font-medium">
              Connected to {connection.cameraName}
            </Text>
            {connection.ipAddress && (
              <Text className="text-green-400/60 text-center text-sm mt-1">
                via {connection.method} · {connection.ipAddress}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={disconnect}
            className="bg-red-500/20 px-8 py-4 rounded-xl w-full mb-3"
          >
            <Text className="text-red-400 text-center font-semibold text-lg">
              Disconnect
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/browse")}
            className="bg-white px-8 py-4 rounded-xl w-full"
          >
            <Text className="text-black text-center font-semibold text-lg">
              Browse Library
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center">
          {error && (
            <View className="bg-red-500/20 px-4 py-3 rounded-xl mb-6 w-full">
              <Text className="text-red-400 text-center text-sm">{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleConnect}
            disabled={loading}
            className={`px-8 py-4 rounded-xl w-full ${
              loading ? "bg-white/30" : "bg-white"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black text-center font-semibold text-lg">
                Connect to Camera
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-white/30 text-xs text-center mt-6">
            Make sure your camera&apos;s WiFi is enabled{"\n"}and connected to
            this device
          </Text>
        </View>
      )}
    </View>
  );
}
