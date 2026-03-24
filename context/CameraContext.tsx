import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { CameraConnection, MediaItem, TransferProgress } from "@/types";
import { ricohGR } from "@/lib/camera/ricohGR";
import { importService } from "@/lib/transfer/importService";

interface CameraContextType {
  connection: CameraConnection;
  library: MediaItem[];
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  loadLibrary: () => Promise<void>;
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

  // Import state
  const [importQueue, setImportQueue] = useState<MediaItem[]>([]);
  const [importProgress, setImportProgress] = useState<TransferProgress | null>(null);
  const [importState, setImportState] = useState<"idle" | "importing" | "done" | "error">("idle");
  const [importError, setImportError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const conn = await ricohGR.connect();
      setConnection(conn);
      if (!conn.isConnected) {
        setError("Could not connect to camera. Make sure WiFi is enabled.");
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
        disconnect,
        loadLibrary,
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
