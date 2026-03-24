import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useCameraContext } from "@/context/CameraContext";

export default function ImportScreen() {
  const {
    importQueue,
    importProgress,
    importState,
    importError,
    startImport,
    resetImport,
  } = useCameraContext();

  if (importQueue.length === 0 && importState === "idle") {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-white/10 items-center justify-center mb-4">
          <Text className="text-2xl">📥</Text>
        </View>
        <Text className="text-white text-lg font-medium mb-2">
          No Items Selected
        </Text>
        <Text className="text-white/50 text-center text-sm">
          Go to Browse to select photos and videos{"\n"}to import from your
          camera
        </Text>
      </View>
    );
  }

  if (importState === "importing") {
    const pct = importProgress?.percentage ?? 0;
    return (
      <View className="flex-1 bg-black px-6 justify-center items-center">
        <View className="w-32 h-32 rounded-full border-4 border-white/20 items-center justify-center mb-6">
          <Text className="text-white text-3xl font-bold">{pct}%</Text>
        </View>
        <Text className="text-white text-lg font-medium mb-2">
          Importing...
        </Text>
        <Text className="text-white/50 text-sm mb-1">
          {importProgress?.currentFile ?? "Starting..."}
        </Text>
        <Text className="text-white/30 text-xs">
          {importProgress?.completed ?? 0} of{" "}
          {importProgress?.total ?? importQueue.length}
        </Text>
        <View className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <View
            className="h-full bg-white rounded-full"
            style={{ width: `${pct}%` }}
          />
        </View>
      </View>
    );
  }

  if (importState === "done") {
    return (
      <View className="flex-1 bg-black px-6 justify-center items-center">
        <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-6">
          <Text className="text-white text-4xl">✓</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">
          Import Complete
        </Text>
        <Text className="text-white/50 text-sm mb-8">
          {importQueue.length}{" "}
          {importQueue.length === 1 ? "item" : "items"} saved to your photos
        </Text>
        <TouchableOpacity
          onPress={resetImport}
          className="bg-white px-8 py-4 rounded-xl w-full"
        >
          <Text className="text-black text-center font-semibold text-lg">
            Done
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (importState === "error") {
    return (
      <View className="flex-1 bg-black px-6 justify-center items-center">
        <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center mb-6">
          <Text className="text-white text-4xl">✕</Text>
        </View>
        <Text className="text-white text-xl font-semibold mb-2">
          Import Failed
        </Text>
        <Text className="text-red-400/70 text-sm mb-8 text-center">
          {importError}
        </Text>
        <TouchableOpacity
          onPress={resetImport}
          className="bg-white px-8 py-4 rounded-xl w-full"
        >
          <Text className="text-black text-center font-semibold text-lg">
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ready to import
  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <Text className="text-white text-xl font-semibold mb-2 text-center">
        Ready to Import
      </Text>
      <Text className="text-white/50 text-sm mb-6 text-center">
        {importQueue.length}{" "}
        {importQueue.length === 1 ? "item" : "items"} selected
      </Text>

      <ScrollView className="max-h-64 mb-6" showsVerticalScrollIndicator={false}>
        {importQueue.map((item) => (
          <View
            key={item.id}
            className="flex-row justify-between items-center py-2 border-b border-white/5"
          >
            <Text className="text-white/80 text-sm flex-1" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-white/30 text-xs ml-2">
              {item.type === "video" ? "▶ " : ""}
              {(item.size / 1_000_000).toFixed(1)} MB
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={startImport} className="bg-white py-4 rounded-xl mb-3">
        <Text className="text-black text-center font-semibold text-lg">
          Start Import
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetImport} className="py-3">
        <Text className="text-white/50 text-center text-sm">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
