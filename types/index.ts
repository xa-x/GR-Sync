export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  thumbnailUrl: string;
  fullUrl: string;
  size: number;
  createdAt: string;
  selected?: boolean;
}

export interface CameraConnection {
  isConnected: boolean;
  method: "wifi" | "bluetooth" | null;
  cameraName: string | null;
  ipAddress?: string;
}

export interface TransferProgress {
  total: number;
  completed: number;
  currentFile: string;
  percentage: number;
}
