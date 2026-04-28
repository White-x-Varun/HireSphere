import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

const Chat: React.FC = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // In a multi-conversation app, this would be dynamic
  const recipientId = "60d5f38b8f8b8b8b8b8b8b8b"; // Placeholder for demo recipient

  const { data: messages, isLoading } = useQuery({
    queryKey: [`/api/messages/${user?.id}`],
    queryFn: () => apiRequest(`/api/messages/${user?.id}`),
    enabled: !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg: any) => apiRequest("/api/messages", {
      method: "POST",
      body: JSON.stringify(msg),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/messages/${user?.id}`], (old: any) => [...(old || []), data]);
    }
  });

  useEffect(() => {
    if (socket) {
      socket.on("message", (msg) => {
        queryClient.setQueryData([`/api/messages/${user?.id}`], (old: any) => [...(old || []), msg]);
      });
    }
    return () => {
      socket?.off("message");
    };
  }, [socket, queryClient, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const msg = {
      senderId: user.id,
      receiverId: recipientId,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    // Emit via socket
    socket?.emit("message", msg);
    
    // Persist to backend
    sendMessageMutation.mutate(msg);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-100px)]">
      <Card className="h-full flex flex-col border-none shadow-2xl bg-background/50 backdrop-blur-xl">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>HA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">HireSphere Assistant</p>
              <p className="text-xs text-muted-foreground">Direct Support Line</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {(messages || []).map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.senderId === user?.id
                        ? "bg-cyan-500 text-black font-medium rounded-tr-none"
                        : "bg-white/10 text-white rounded-tl-none border border-white/5"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
              {(messages || []).length === 0 && (
                <div className="text-center py-24 text-gray-500 italic">
                  Start a conversation with HireSphere assistant...
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-white/10 bg-black/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border-white/10 focus-visible:ring-cyan-500/50"
              />
              <Button type="submit" size="icon" className="rounded-full bg-cyan-500 text-black hover:bg-cyan-600">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
