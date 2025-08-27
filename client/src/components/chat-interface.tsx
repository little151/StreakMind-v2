import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Bot } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// import type { Message } from "../../shared/schema";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/messages'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', { content });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habit-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-badges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recent-activities'] });
      
      // Force refetch of all data to ensure dashboard updates
      queryClient.refetchQueries({ queryKey: ['/api/user'] });
      queryClient.refetchQueries({ queryKey: ['/api/habits'] });
      queryClient.refetchQueries({ queryKey: ['/api/habit-entries'] });
      queryClient.refetchQueries({ queryKey: ['/api/user-badges'] });
    },
  });

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessageMutation.mutate(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background" data-testid="chat-interface">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground px-4">
              <Bot className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-muted-foreground/60" />
              <p className="text-lg sm:text-xl mb-3 text-foreground font-medium">Start tracking your habits!</p>
              <p className="text-sm">Try typing: "Did 2 coding questions today" or "Went to gym for 1 hour"</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 mb-4 ${
                message.isFromUser ? 'flex-row-reverse' : 'flex-row'
              }`}
              data-testid={`message-${message.isFromUser ? 'user' : 'bot'}-${message.id}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isFromUser 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}>
                {message.isFromUser ? (
                  <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Message bubble */}
              <div className={`flex flex-col max-w-[70%] sm:max-w-md ${
                message.isFromUser ? 'items-end' : 'items-start'
              }`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm break-words ${
                  message.isFromUser
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border text-card-foreground rounded-bl-md'
                }`}>
                  {message.content}
                </div>
                <div className={`text-xs text-muted-foreground mt-1 px-1 ${
                  message.isFromUser ? 'text-right' : 'text-left'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border p-4 sm:p-6">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type your habit update... (e.g., 'Did 30 min meditation')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 px-4 rounded-xl border-input bg-background focus:ring-2 focus:ring-accent focus:border-accent"
              data-testid="input-message"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            size="icon"
            className="h-12 w-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
