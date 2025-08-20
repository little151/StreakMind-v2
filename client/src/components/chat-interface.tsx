import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Bot } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@shared/schema";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habit-entries'] });
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Bot className="h-16 w-16 mx-auto mb-6 text-muted-foreground/60" />
              <p className="text-xl mb-3 text-foreground font-medium">Start tracking your habits!</p>
              <p className="text-sm">Try typing: "Did 2 coding questions today" or "Went to gym for 1 hour"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end space-x-3 ${
                message.isFromUser ? 'justify-end flex-row-reverse space-x-reverse' : ''
              }`}
              data-testid={`message-${message.isFromUser ? 'user' : 'bot'}-${message.id}`}
            >
              {message.isFromUser ? (
                <>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                  <div className="flex flex-col space-y-1 max-w-md">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                      {message.content}
                    </div>
                    <div className="text-xs text-muted-foreground mr-2 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col space-y-1 max-w-md">
                    <div className="bg-card border border-border text-card-foreground rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      {message.content}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border p-6">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
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
