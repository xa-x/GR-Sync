import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { importService } from "@/lib/transfer/importService";
import { MediaItem, TransferProgress } from "@/types";

export default function ImportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ items?: string }>();
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [importing, setImporting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const items: MediaItem[] = params.items ? JSON.parse(params.items) : [];

  useEffect(() => {
    startImport();
  }, []);

  const startImport = async () => {
    const hasPermission = await importService.requestPermissions();
    
    if (!hasPermission) {
      setError("Photo library permission required");
      setImporting(false);
      return;
    }

    try {
      await importService.importItems(items, (p) => {
        setProgress(p);
      });
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleDone = () => {
    router.back();
    router.back();
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      {importing ? (
        <View className="items-center">
          {/* Progress Circle */}
          <View className="w-32 h-32 rounded-full border-4 border-white/20 items-center justify-center mb-6">
            <Text className="text-white text-3xl font-bold">
              {progress?.percentage ?? 0}%
            </Text>
          </View>

          <Text className="text-white text-lg font-medium mb-2">
            Importing...
          </Text>
          
          <Text className="text-white/50 text-sm mb-1">
            {progress?.currentFile ?? "Starting..."}
          </Text>
          
          <Text className="text-white/30 text-xs">
            {progress?.completed ?? 0} of {progress?.total ?? items.length}
          </Text>

          <View className="w-full h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
            <View
              className="h-full bg-white rounded-full"
              style={{ width: `${progress?.percentage ?? 0}%` }}
            />
          </View>
        </View>
      ) : completed ? (
        <View className="items-center">
          {/* Success */}
          <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-6">
            <Text className="text-4xl">✓</Text>
          </View>

          <Text className="text-white text-xl font-semibold mb-2">
            Import Complete
          </Text>
          
          <Text className="text-white/50 text-sm mb-8">
            {items.length} {items.length === 1 ? "item" : "items"} saved to your photos
          </Text>

          <TouchableOpacity
            onPress={handleDone}
            className="bg-white px-8 py-4 rounded-xl w-full"
          >
            <Text className="text-black text-center font-semibold text-lg">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center">
          {/* Error */}
          <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center mb-6">
            <Text className="text-4xl">✕</Text>
          </View>

          <Text className="text-white text-xl font-semibold mb-2">
            Import Failed
          </Text>
          
          <Text className="text-red-400/70 text-sm mb-8 text-center">
            {error}
          </Text>

          <TouchableOpacity
            onPress={handleDone}
            className="bg-white px-8 py-4 rounded-xl w-full"
          >
            <Text className="text-black text-center font-semibold text-lg">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
