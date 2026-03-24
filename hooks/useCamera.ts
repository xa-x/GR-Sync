import { useState, useCallback } from "react";
import { CameraConnection, MediaItem } from "@/types";
import { ricohGR } from "@/lib/camera/ricohGR";

export function useCamera() {
  const [connection, setConnection] = useState<CameraConnection>(
    ricohGR.getConnection()
  );
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    connection,
    library,
    loading,
    error,
    connect,
    disconnect,
    loadLibrary,
  };
}
