"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export function useSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.connect();

    return () => {
      disconnectSocket();
      setIsConnected(false);
    };
  }, [token]);

  return { socket: socketRef.current, isConnected };
}
