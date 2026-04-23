import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface SocketContextType {
  socket: Socket | null;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  setNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch existing notifications
      apiRequest(`/api/notifications/${user.id}`)
        .then((data) => setNotifications(data))
        .catch((err) => console.error("Failed to fetch notifications", err));

      const newSocket = io("http://localhost:5000"); // Adjust for production
      setSocket(newSocket);

      newSocket.emit("join", user.id);

      newSocket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === "error" ? "destructive" : "default",
        });
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setNotifications([]);
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
