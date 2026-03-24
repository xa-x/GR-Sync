import { CameraConnection, MediaItem } from "@/types";
import {
  getCurrentSSID,
  scanForRicohCameras,
  connectToCamera,
  disconnectFromCamera,
  WiFiNetwork,
} from "../wifi/service";

const RICOH_DEFAULT_IP = "192.168.0.1";

export type { WiFiNetwork };

class RicohGRService {
  private connection: CameraConnection = {
    isConnected: false,
    method: null,
    cameraName: null,
  };

  async scanForCameras(): Promise<WiFiNetwork[]> {
    return scanForRicohCameras();
  }

  async connectToCamera(ssid: string, password?: string): Promise<CameraConnection> {
    const success = await connectToCamera(ssid, password);

    if (success) {
      // Verify camera HTTP endpoint is reachable
      const httpAvailable = await this.checkHTTPConnection();

      if (httpAvailable) {
        this.connection = {
          isConnected: true,
          method: "wifi",
          cameraName: ssid,
          ipAddress: RICOH_DEFAULT_IP,
        };
        return this.connection;
      }
    }

    this.connection = {
      isConnected: false,
      method: null,
      cameraName: null,
    };

    return this.connection;
  }

  private async checkHTTPConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`http://${RICOH_DEFAULT_IP}/`, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getLibrary(): Promise<MediaItem[]> {
    if (!this.connection.isConnected) {
      throw new Error("Not connected to camera");
    }

    // In production, this would hit the actual Ricoh API
    // GET http://192.168.0.1/library or similar
    return this.getMockLibrary();
  }

  private getMockLibrary(): MediaItem[] {
    return Array.from({ length: 24 }, (_, i) => ({
      id: `IMG_${String(i + 1).padStart(4, "0")}`,
      name: `IMG_${String(i + 1).padStart(4, "0")}.jpg`,
      type: i % 6 === 0 ? "video" : "image" as const,
      thumbnailUrl: `https://placehold.co/200x200/1a1a1a/666?text=${i + 1}`,
      fullUrl: `http://${RICOH_DEFAULT_IP}/files/IMG_${String(i + 1).padStart(4, "0")}.jpg`,
      size: Math.floor(Math.random() * 10000000) + 1000000,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }

  async downloadFile(item: MediaItem): Promise<string> {
    // In production: download from camera via HTTP
    await new Promise((resolve) => setTimeout(resolve, 500));
    return item.fullUrl;
  }

  getConnection(): CameraConnection {
    return this.connection;
  }

  async getCurrentNetwork(): Promise<string | null> {
    return getCurrentSSID();
  }

  disconnect(): void {
    disconnectFromCamera();
    this.connection = {
      isConnected: false,
      method: null,
      cameraName: null,
    };
  }
}

export const ricohGR = new RicohGRService();
