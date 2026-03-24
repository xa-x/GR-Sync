import { Platform, PermissionsAndroid } from "react-native";
import WifiManager from "react-native-wifi-reborn";
import * as Location from "expo-location";

export interface WiFiNetwork {
  ssid: string;
  bssid: string;
  strength: number;
  isRicohGR: boolean;
}

const RICOH_SSID_PREFIXES = ["RICOH GR", "GR III", "GR3", "GR II"];

function isRicohGR(ssid: string): boolean {
  return RICOH_SSID_PREFIXES.some((prefix) =>
    ssid.toUpperCase().includes(prefix.toUpperCase())
  );
}

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
  try {
    const ssid = await WifiManager.getCurrentWifiSSID();
    return ssid;
  } catch {
    return null;
  }
}

export async function scanForRicohCameras(): Promise<WiFiNetwork[]> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    throw new Error("Location permission required to scan for cameras");
  }

  try {
    // On Android, we can scan for networks
    // On iOS, we can only get the current SSID
    if (Platform.OS === "android") {
      const networks = await WifiManager.loadWifiList();
      
      return networks
        .filter((net) => net.SSID && isRicohGR(net.SSID))
        .map((net) => ({
          ssid: net.SSID,
          bssid: net.BSSID || "",
          strength: net.level || 0,
          isRicohGR: true,
        }))
        .sort((a, b) => b.strength - a.strength);
    }

    // iOS fallback - check if currently connected to Ricoh GR
    const currentSsid = await getCurrentSSID();
    if (currentSsid && isRicohGR(currentSsid)) {
      return [
        {
          ssid: currentSsid,
          bssid: "",
          strength: 100,
          isRicohGR: true,
        },
      ];
    }

    return [];
  } catch (error) {
    console.error("Scan error:", error);
    return [];
  }
}

export async function connectToCamera(
  ssid: string,
  password?: string
): Promise<boolean> {
  try {
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
    const currentSsid = await getCurrentSSID();
    return currentSsid === ssid;
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
