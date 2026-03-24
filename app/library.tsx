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
import { useCamera } from "@/hooks/useCamera";
import { MediaItem } from "@/types";

export default function LibraryScreen() {
  const router = useRouter();
  const { library, loading, error, loadLibrary } = useCamera();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLibrary();
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
    const selectedItems = library.filter((item) => selected.has(item.id));
    // Pass selected items to import screen
    router.push({
      pathname: "/import",
      params: { items: JSON.stringify(selectedItems) },
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: MediaItem }) => (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        className="m-0.5"
      >
        <View className="relative">
          <Image
            source={{ uri: item.thumbnailUrl }}
            className="w-[calc(33%-4px)] aspect-square rounded-lg"
            style={{ width: 120, height: 120 }}
            contentFit="cover"
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
      {/* Header Actions */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/10">
        <TouchableOpacity onPress={selectAll}>
          <Text className="text-white/70 text-sm">
            {selected.size === library.length ? "Deselect all" : "Select all"}
          </Text>
        </TouchableOpacity>
        <Text className="text-white/50 text-sm">
          {selected.size} selected
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={library}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        className="flex-1 px-1"
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Action */}
      {selected.size > 0 && (
        <View className="p-4 border-t border-white/10">
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
