import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

const Chat: React.FC = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(null);

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
  }, [messages, activeRecipientId]);

  // Group messages by conversation
  const conversations = useMemo(() => {
    if (!messages || !user) return [];
    const map = new Map<string, any>();
    
    messages.forEach((msg: any) => {
      const sender = typeof msg.senderId === 'object' ? msg.senderId : { _id: msg.senderId, name: "Unknown" };
      const receiver = typeof msg.receiverId === 'object' ? msg.receiverId : { _id: msg.receiverId, name: "Unknown" };
      
      const isUserSender = sender._id === user.id;
      
      const otherId = isUserSender ? receiver._id : sender._id;
      const otherName = isUserSender ? receiver.name : sender.name;

      if (!otherId) return;

      if (!map.has(otherId)) {
        map.set(otherId, {
          id: otherId,
          name: otherName,
          lastMessage: msg,
          messages: []
        });
      }
      
      const conv = map.get(otherId);
      conv.lastMessage = msg; 
      conv.messages.push(msg);
    });
    
    return Array.from(map.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages, user]);

  useEffect(() => {
    if (conversations.length > 0 && !activeRecipientId) {
      setActiveRecipientId(conversations[0].id);
    }
  }, [conversations, activeRecipientId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !activeRecipientId) return;

    const msg = {
      senderId: user.id,
      receiverId: activeRecipientId,
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

  const activeConversation = conversations.find(c => c.id === activeRecipientId);

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-100px)]">
      <Card className="h-full flex overflow-hidden border-none shadow-2xl bg-background/50 backdrop-blur-xl">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-cyan-400" />
              Messages
            </h2>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveRecipientId(conv.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      activeRecipientId === conv.id ? "bg-cyan-500/20 border border-cyan-500/30" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarFallback className="bg-white/5 text-cyan-400">
                        {conv.name?.substring(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className={`font-medium text-sm truncate ${activeRecipientId === conv.id ? "text-cyan-400" : "text-white"}`}>
                          {conv.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {activeConversation ? (
            <>
              <CardHeader className="border-b border-white/10 bg-black/20">
                <CardTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                      {activeConversation.name?.substring(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-white">{activeConversation.name}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeConversation.messages.map((msg: any, i: number) => {
                      const isMe = (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) === user?.id;
                      return (
                        <div
                          key={i}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-2xl ${
                              isMe
                                ? "bg-cyan-500 text-black font-medium rounded-tr-none"
                                : "bg-white/10 text-white rounded-tl-none border border-white/5"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? "opacity-70" : "text-gray-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-white/10 bg-black/40">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Chat;
