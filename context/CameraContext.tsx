import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CameraConnection, MediaItem, TransferProgress } from "@/types";
import { ricohGR, WiFiNetwork } from "@/lib/camera/ricohGR";
import { importService } from "@/lib/transfer/importService";

interface CameraContextType {
  connection: CameraConnection;
  library: MediaItem[];
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  connectToSSID: (ssid: string, password?: string) => Promise<void>;
  connectByIP: () => Promise<void>;
  disconnect: () => void;
  loadLibrary: () => Promise<void>;
  scanForCameras: () => Promise<WiFiNetwork[]>;
  availableCameras: WiFiNetwork[];
  importQueue: MediaItem[];
  setImportQueue: (items: MediaItem[]) => void;
  importProgress: TransferProgress | null;
  importState: "idle" | "importing" | "done" | "error";
  importError: string | null;
  startImport: () => Promise<void>;
  resetImport: () => void;
}

const CameraContext = createContext<CameraContextType | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<CameraConnection>(
    ricohGR.getConnection()
  );
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<WiFiNetwork[]>([]);

  // Import state
  const [importQueue, setImportQueue] = useState<MediaItem[]>([]);
  const [importProgress, setImportProgress] = useState<TransferProgress | null>(null);
  const [importState, setImportState] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [importError, setImportError] = useState<string | null>(null);

  const scanForCameras = useCallback(async (): Promise<WiFiNetwork[]> => {
    setLoading(true);
    setError(null);
    try {
      const cameras = await ricohGR.scanForCameras();
      setAvailableCameras(cameras);
      return cameras;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to scan for cameras";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First scan for cameras
      const cameras = await ricohGR.scanForCameras();
      setAvailableCameras(cameras);

      if (cameras.length === 0) {
        setError("No Ricoh GR cameras found. Make sure your camera's WiFi is enabled.");
        return;
      }

      // Auto-connect to first camera found
      const firstCamera = cameras[0];
      const conn = await ricohGR.connectToCamera(firstCamera.ssid);
      setConnection(conn);

      if (!conn.isConnected) {
        setError("Could not connect to camera. Try selecting manually.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const connectToSSID = useCallback(async (ssid: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      const conn = await ricohGR.connectToCamera(ssid, password);
      setConnection(conn);

      if (!conn.isConnected) {
        setError("Could not connect to camera.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const connectByIP = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const conn = await ricohGR.connectByIP();
      setConnection(conn);

      if (!conn.isConnected) {
        setError("Could not reach camera at 192.168.0.1. Make sure you're connected to the camera's WiFi.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    ricohGR.disconnect();
    setConnection(ricohGR.getConnection());
    setLibrary([]);
    setImportQueue([]);
    setImportState("idle");
    setImportProgress(null);
    setImportError(null);
    setAvailableCameras([]);
  }, []);

  const loadLibrary = useCallback(async () => {
    if (!connection.isConnected) {
      setError("Not connected to camera");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await ricohGR.getLibrary();
      setLibrary(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, [connection.isConnected]);

  const startImport = useCallback(async () => {
    if (importQueue.length === 0) return;

    const hasPermission = await importService.requestPermissions();
    if (!hasPermission) {
      setImportError("Photo library permission required");
      setImportState("error");
      return;
    }

    setImportState("importing");
    setImportError(null);
    setImportProgress(null);

    try {
      await importService.importItems(importQueue, (p) => {
        setImportProgress(p);
      });
      setImportState("done");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
      setImportState("error");
    }
  }, [importQueue]);

  const resetImport = useCallback(() => {
    setImportQueue([]);
    setImportProgress(null);
    setImportState("idle");
    setImportError(null);
  }, []);

  return (
    <CameraContext.Provider
      value={{
        connection,
        library,
        loading,
        error,
        connect,
        connectToSSID,
        connectByIP,
        disconnect,
        loadLibrary,
        scanForCameras,
        availableCameras,
        importQueue,
        setImportQueue,
        importProgress,
        importState,
        importError,
        startImport,
        resetImport,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraContext() {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCameraContext must be used within CameraProvider");
  return ctx;
}
