import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Bot, Trash2, X } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";
// import type { Message } from "../../shared/schema";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      
      // Auto-focus input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest('DELETE', `/api/messages/${messageId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const clearAllMessagesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/messages');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessageMutation.mutate(inputValue.trim());
      setInputValue("");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate(messageId);
  };

  const handleClearAllMessages = () => {
    clearAllMessagesMutation.mutate();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input on component mount and after messages load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-focus input after messages update
  useEffect(() => {
    if (!sendMessageMutation.isPending) {
      inputRef.current?.focus();
    }
  }, [messages, sendMessageMutation.isPending]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background" data-testid="chat-interface">
      {/* Chat Header with Clear All Button */}
      {messages.length > 0 && (
        <div className="border-b border-border p-4 flex justify-between items-center">
          <h3 className="text-sm font-medium text-muted-foreground">Chat History</h3>
          <Button
            onClick={handleClearAllMessages}
            disabled={clearAllMessagesMutation.isPending}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            data-testid="button-clear-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}

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
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: message.isFromUser ? 100 : -100 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 mb-4 group ${
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
                    <div className={`relative px-4 py-3 rounded-2xl shadow-sm break-words ${
                      message.isFromUser
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border text-card-foreground rounded-bl-md'
                    }`}>
                      {message.content}
                      
                      {/* Delete button (appears on hover) */}
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className={`absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
                          message.isFromUser ? '-left-2' : '-right-2'
                        }`}
                        data-testid={`button-delete-message-${message.id}`}
                        title="Delete message"
                      >
                        <X className="h-3 w-3" />
                      </button>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border p-4 sm:p-6">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your habit update... (e.g., 'Did 30 min meditation')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 px-4 rounded-xl border-input bg-background focus:ring-2 focus:ring-accent focus:border-accent"
              data-testid="input-message"
              autoFocus
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
