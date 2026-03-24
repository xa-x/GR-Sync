import { CameraConnection, MediaItem } from "@/types";

const RICOH_DEFAULT_IP = "192.168.0.1";
const RICOH_SSID_PREFIX = "RICOH GR";

class RicohGRService {
  private connection: CameraConnection = {
    isConnected: false,
    method: null,
    cameraName: null,
  };

  async checkWiFiConnection(): Promise<boolean> {
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

  async connect(): Promise<CameraConnection> {
    // Try WiFi first
    const wifiAvailable = await this.checkWiFiConnection();

    if (wifiAvailable) {
      this.connection = {
        isConnected: true,
        method: "wifi",
        cameraName: "RICOH GR III",
        ipAddress: RICOH_DEFAULT_IP,
      };
      return this.connection;
    }

    // Bluetooth fallback would go here
    // For now, return disconnected
    this.connection = {
      isConnected: false,
      method: null,
      cameraName: null,
    };

    return this.connection;
  }

  async getLibrary(): Promise<MediaItem[]> {
    if (!this.connection.isConnected) {
      throw new Error("Not connected to camera");
    }

    // In production, this would hit the actual Ricoh API
    // GET http://192.168.0.1/library or similar
    
    // For now, return mock data for UI development
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
    // For now, simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return item.fullUrl;
  }

  getConnection(): CameraConnection {
    return this.connection;
  }

  disconnect(): void {
    this.connection = {
      isConnected: false,
      method: null,
      cameraName: null,
    };
  }
}

export const ricohGR = new RicohGRService();
