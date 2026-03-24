import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { MediaItem, TransferProgress } from "@/types";
import { ricohGR } from "../camera/ricohGR";

class ImportService {
  private abortController: AbortController | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === "granted";
  }

  async importItems(
    items: MediaItem[],
    onProgress?: (progress: TransferProgress) => void
  ): Promise<string[]> {
    this.abortController = new AbortController();
    const importedIds: string[] = [];

    for (let i = 0; i < items.length; i++) {
      if (this.abortController.signal.aborted) {
        break;
      }

      const item = items[i];
      
      onProgress?.({
        total: items.length,
        completed: i,
        currentFile: item.name,
        percentage: Math.round((i / items.length) * 100),
      });

      try {
        // Download from camera
        const fileUrl = await ricohGR.downloadFile(item);

        // Save to device photo library
        if (item.type === "image") {
          await MediaLibrary.createAssetAsync(fileUrl);
        } else {
          // For videos
          await MediaLibrary.createAssetAsync(fileUrl);
        }

        importedIds.push(item.id);
      } catch (error) {
        console.error(`Failed to import ${item.name}:`, error);
      }
    }

    onProgress?.({
      total: items.length,
      completed: items.length,
      currentFile: "Done",
      percentage: 100,
    });

    return importedIds;
  }

  cancel(): void {
    this.abortController?.abort();
  }
}

export const importService = new ImportService();
