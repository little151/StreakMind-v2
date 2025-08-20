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
    <div className="h-full flex flex-col" data-testid="chat-interface">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Start tracking your habits!</p>
              <p className="text-sm">Try typing: "Did 2 coding questions today" or "Mark gym done"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end space-x-2 ${
                message.isFromUser ? '' : 'justify-end'
              }`}
            >
              {message.isFromUser ? (
                <div className="flex flex-col space-y-1 max-w-xs">
                  <div className="bg-accent text-white rounded-2xl rounded-br-md px-4 py-2">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-1 max-w-xs">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2">
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mr-2 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type your habit update... (e.g., 'Did 30 min meditation')"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-4 py-3 rounded-full border-gray-300 focus:ring-2 focus:ring-accent focus:border-transparent"
              data-testid="input-message"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            className="bg-accent hover:bg-accent-light text-white p-3 rounded-full"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
