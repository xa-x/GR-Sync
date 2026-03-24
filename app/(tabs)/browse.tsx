import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useCameraContext } from "@/context/CameraContext";
import { MediaItem } from "@/types";

export default function BrowseScreen() {
  const router = useRouter();
  const {
    connection,
    library,
    loading,
    error,
    loadLibrary,
    setImportQueue,
  } = useCameraContext();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (connection.isConnected && library.length === 0) {
      loadLibrary();
    }
  }, [connection.isConnected]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === library.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(library.map((item) => item.id)));
    }
  }, [library, selected.size]);

  const handleImport = () => {
    const items = library.filter((item) => selected.has(item.id));
    setImportQueue(items);
    router.push("/(tabs)/import");
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${(bytes / 1_000).toFixed(0)} KB`;
  };

  const renderItem = useCallback(
    ({ item }: { item: MediaItem }) => (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        className="m-0.5"
      >
        <View className="relative">
          <Image
            source={{ uri: item.thumbnailUrl || item.fullUrl }}
            style={{ width: 120, height: 120 }}
            contentFit="cover"
            className="rounded-lg"
          />
          {selected.has(item.id) && (
            <View className="absolute inset-0 bg-blue-500/40 rounded-lg" />
          )}
          {item.type === "video" && (
            <View className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded">
              <Text className="text-white text-xs">▶</Text>
            </View>
          )}
          {selected.has(item.id) && (
            <View className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
              <Text className="text-white text-sm">✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [selected, toggleSelect]
  );

  if (!connection.isConnected) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-white/10 items-center justify-center mb-4">
          <Text className="text-2xl">📡</Text>
        </View>
        <Text className="text-white text-lg font-medium mb-2">
          Not Connected
        </Text>
        <Text className="text-white/50 text-center text-sm">
          Connect to your Ricoh GR camera first
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#fff" size="large" />
        <Text className="text-white/50 mt-4">Loading library...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-red-400 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={loadLibrary}
          className="bg-white px-6 py-3 rounded-xl"
        >
          <Text className="text-black font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
        <TouchableOpacity onPress={selectAll}>
          <Text className="text-white/70 text-sm">
            {selected.size === library.length ? "Deselect all" : "Select all"}
          </Text>
        </TouchableOpacity>
        <Text className="text-white/50 text-sm">
          {selected.size} of {library.length} selected
        </Text>
      </View>

      <FlatList
        data={library}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
      />

      {selected.size > 0 && (
        <View className="p-4 border-t border-white/10 bg-black">
          <TouchableOpacity
            onPress={handleImport}
            className="bg-white py-4 rounded-xl"
          >
            <Text className="text-black text-center font-semibold text-lg">
              Import {selected.size} {selected.size === 1 ? "item" : "items"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
