import { Platform, PermissionsAndroid } from "react-native";
import WifiManager from "react-native-wifi-reborn";
import * as Location from "expo-location";
import * as Device from "expo-device";

export interface WiFiNetwork {
  ssid: string;
  bssid: string;
  strength: number;
  isRicohGR: boolean;
}

const RICOH_SSID_PREFIXES = ["RICOH GR", "GR III", "GR3", "GR II"];
export const RICOH_CAMERA_IP = "192.168.0.1";

function isRicohGR(ssid: string): boolean {
  return RICOH_SSID_PREFIXES.some((prefix) =>
    ssid.toUpperCase().includes(prefix.toUpperCase())
  );
}

async function probeCameraAtIP(ip: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`http://${ip}/`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export { probeCameraAtIP };

function isSimulator(): boolean {
  return !Device.isDevice;
}

const IS_SIMULATOR = isSimulator();

export { IS_SIMULATOR };

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message:
          "GR Sync needs location permission to scan for WiFi networks.",
        buttonNegative: "Deny",
        buttonPositive: "Allow",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // iOS
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentSSID(): Promise<string | null> {
  if (IS_SIMULATOR) return null;
  try {
    const ssid = await WifiManager.getCurrentWifiSSID();
    return ssid;
  } catch {
    return null;
  }
}

export async function scanForRicohCameras(): Promise<WiFiNetwork[]> {
  if (IS_SIMULATOR) {
    console.warn("WiFi scanning not available on simulator. Use a physical device.");
    return [];
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    throw new Error("Location permission required to scan for cameras");
  }

  try {
    const results: WiFiNetwork[] = [];

    // On Android, scan for nearby WiFi networks
    if (Platform.OS === "android") {
      try {
        const networks = await WifiManager.loadWifiList();
        const ricohNetworks = networks
          .filter((net) => net.SSID && isRicohGR(net.SSID))
          .map((net) => ({
            ssid: net.SSID,
            bssid: net.BSSID || "",
            strength: net.level || 0,
            isRicohGR: true,
          }))
          .sort((a, b) => b.strength - a.strength);
        results.push(...ricohNetworks);
      } catch {
        // WiFi list not available, fall through to probe
      }
    }

    // On both platforms, probe the local network for the camera
    // This works if the phone is already connected to the camera's WiFi
    const cameraFound = await probeCameraAtIP(RICOH_CAMERA_IP);
    if (cameraFound) {
      // Get the current SSID to identify the camera
      const currentSsid = await getCurrentSSID();
      const alreadyListed = results.some(
        (r) => currentSsid && r.ssid === currentSsid
      );

      if (!alreadyListed) {
        results.push({
          ssid: currentSsid || `Ricoh GR (${RICOH_CAMERA_IP})`,
          bssid: "",
          strength: 100,
          isRicohGR: true,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Scan error:", error);
    return [];
  }
}

export async function connectToCamera(
  ssid: string,
  password?: string
): Promise<boolean> {
  if (IS_SIMULATOR) {
    console.warn("WiFi connection not available on simulator. Use a physical device.");
    return false;
  }

  try {
    // Check if already connected to this SSID (e.g., connected via iOS Settings)
    const currentSsid = await getCurrentSSID();
    if (currentSsid === ssid) {
      return true;
    }

    const isWep = false;
    const isHidden = false;

    // Ricoh GR cameras typically don't require a password in WiFi Direct mode
    // But some models might
    if (password) {
      await WifiManager.connectToProtectedSSID(
        ssid,
        password,
        isWep,
        isHidden
      );
    } else {
      // Try without password (open network)
      await WifiManager.connectToProtectedSSID(
        ssid,
        "",
        isWep,
        isHidden
      );
    }

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify connection
    const updatedSsid = await getCurrentSSID();
    return updatedSsid === ssid;
  } catch (error) {
    console.error("Connect error:", error);
    return false;
  }
}

export async function disconnectFromCamera(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await WifiManager.disconnect();
    }
  } catch (error) {
    console.error("Disconnect error:", error);
  }
}
