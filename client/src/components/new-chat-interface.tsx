import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Info, Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface ChatResponse {
  reply: string;
  logEntry?: any;
  pointsAwarded?: number;
  streakUpdated?: boolean;
  currentStreak?: number;
}

interface NewChatInterfaceProps {
  onStatsUpdate: () => void;
}

export default function NewChatInterface({ onStatsUpdate }: NewChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Maintain input focus
  useEffect(() => {
    if (!isLoading && !isMultiSelectMode) {
      inputRef.current?.focus();
    }
  }, [isLoading, isMultiSelectMode]);

  const loadMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded messages:", data);
        setMessages(data);
      } else {
        console.error("Failed to load messages:", response.status, response.statusText);
        const errorBody = await response.text();
        console.error("Error body:", errorBody);
      }
    } catch (error) {
      console.error("Error loading messages:", error instanceof Error ? error.message : error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setInputValue("");
    setIsLoading(true);

    // Maintain cursor focus after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputValue.trim() })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();
      
      // Reload messages to get the latest from server
      await loadMessages();

      // Refresh stats if data was updated
      if (data.logEntry) {
        await refreshStats();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        message: "Sorry, I couldn't process that message. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Ensure focus returns to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadMessages();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const clearAllMessages = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessages([]);
        setSelectedMessages(new Set());
        setIsMultiSelectMode(false);
      }
    } catch (error) {
      console.error("Error clearing messages:", error);
    }
  };

  const toggleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAllMessages = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;

    try {
      // Delete messages in batch
      await Promise.all(
        Array.from(selectedMessages).map(messageId =>
          fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
        )
      );
      
      await loadMessages();
      setSelectedMessages(new Set());
      setIsMultiSelectMode(false);
    } catch (error) {
      console.error("Error deleting selected messages:", error);
    }
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedMessages(new Set());
  };

  const refreshStats = async () => {
    try {
      onStatsUpdate();
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const InfoModal = () => {
    if (!showInfoModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="modal-info">
        <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">How StreakMind Works</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfoModal(false)}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-close-info"
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-5 text-sm">
            {/* Natural Chat Logging */}
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                💬 Natural Chat Logging
              </h4>
              <p className="text-muted-foreground mb-2">Just chat naturally about your activities:</p>
              <div className="space-y-1 text-muted-foreground ml-4">
                <div>• "Did 2 coding questions"</div>
                <div>• "Went to gym today"</div>
                <div>• "Slept 7 hours"</div>
                <div>• "Read 30 pages"</div>
                <div>• "Meditated for 15 minutes"</div>
              </div>
            </div>

            {/* Dynamic Activity Creation */}
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                ⭐ Create New Habits
              </h4>
              <p className="text-muted-foreground mb-2">Add new activities to track:</p>
              <div className="space-y-1 text-muted-foreground ml-4">
                <div>• "I want to track guitar practice"</div>
                <div>• "Start tracking water intake"</div>
                <div>• "Add stretching to my habits"</div>
              </div>
            </div>

            {/* AI Personalities */}
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                🎭 AI Personality Modes
              </h4>
              <p className="text-muted-foreground mb-2">I adapt my personality based on your needs:</p>
              <div className="space-y-1 text-muted-foreground ml-4">
                <div>• <strong className="text-blue-400">Therapist</strong> - Emotional support & understanding</div>
                <div>• <strong className="text-green-400">Friend</strong> - Casual & encouraging</div>
                <div>• <strong className="text-orange-400">Trainer</strong> - High-energy motivation</div>
              </div>
            </div>

            {/* Gamification Toggle */}
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                🎮 Optional Gamification
              </h4>
              <p className="text-muted-foreground mb-2">Control your experience:</p>
              <div className="space-y-1 text-muted-foreground ml-4">
                <div>• Toggle scores ON/OFF in settings</div>
                <div>• Focus mode hides points & badges</div>
                <div>• Tile dashboard adapts to your preferences</div>
              </div>
            </div>

            {/* Chat Persistence */}
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                💾 Persistent Chat
              </h4>
              <p className="text-muted-foreground mb-2">Your conversations are now saved automatically:</p>
              <div className="space-y-1 text-muted-foreground ml-4">
                <div>• Chats persist after page refresh</div>
                <div>• Delete individual messages by hovering</div>
                <div>• Clear all messages with "Clear All" button</div>
                <div>• All data stored locally in chatData.json</div>
              </div>
            </div>

            {/* Activity Management */}
            <div>
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                ⚙️ Activity Management
              </h4>
              <p className="text-muted-foreground mb-2">Full control over your habits:</p>
              <div className="space-y-1 text-muted-foreground ml-4">
                <div>• Edit activity names on dashboard</div>
                <div>• Choose visualization types (heatmap, bar, progress, pie)</div>
                <div>• Delete activities you no longer track</div>
                <div>• All changes saved to data.json</div>
              </div>
            </div>

            {/* Tips */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-foreground mb-2">💡 Pro Tips</h4>
              <div className="space-y-1 text-muted-foreground text-xs">
                <div>• Use "yesterday" to log for previous day</div>
                <div>• Activities auto-appear in your dashboard</div>
                <div>• Streaks build with daily consistency</div>
                <div>• Settings panel is now responsive and scrollable</div>
                <div>• Smooth animations enhance the experience</div>
                <div>• Ask me anything - I'm here to help!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <InfoModal />
      
      {/* Header with Info Button */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Chat {isMultiSelectMode && selectedMessages.size > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              ({selectedMessages.size} selected)
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {messages.length > 0 && !isMultiSelectMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMultiSelectMode}
                className="text-muted-foreground hover:text-foreground"
                title="Select messages"
                data-testid="button-multi-select"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllMessages}
                className="text-muted-foreground hover:text-destructive"
                title="Clear all messages"
                data-testid="button-clear-all"
              >
                Clear All
              </Button>
            </>
          )}
          
          {isMultiSelectMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllMessages}
                className="text-muted-foreground hover:text-foreground"
                title="Select all messages"
                data-testid="button-select-all"
              >
                {selectedMessages.size === messages.length ? "Deselect All" : "Select All"}
              </Button>
              {selectedMessages.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteSelectedMessages}
                  className="text-muted-foreground hover:text-destructive"
                  title="Delete selected messages"
                  data-testid="button-delete-selected"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedMessages.size})
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMultiSelectMode}
                className="text-muted-foreground hover:text-foreground"
                title="Exit selection mode"
                data-testid="button-exit-select"
              >
                Cancel
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfoModal(true)}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-info"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <p className="text-lg mb-2 text-foreground font-medium">Start tracking your habits!</p>
              <p className="text-sm">Try: "Did 2 coding questions" or "Went to gym"</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`msg ${message.role === 'user' ? 'user' : 'bot'} animate-in slide-in-from-bottom-2 duration-300 ${isMultiSelectMode ? 'cursor-pointer' : ''}`}
              onClick={() => isMultiSelectMode && toggleSelectMessage(message.id)}
            >
              <div className={`flex items-start gap-3 max-w-[80%] group ${selectedMessages.has(message.id) ? 'bg-accent/10 rounded-lg p-2' : ''}`}>
                {/* Selection checkbox */}
                {isMultiSelectMode && (
                  <div className="flex items-center pt-1">
                    {selectedMessages.has(message.id) ? (
                      <CheckSquare className="h-4 w-4 text-accent" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
                
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="bubble relative">
                  {message.message}
                  {!isMultiSelectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(message.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      title="Delete message"
                      data-testid={`button-delete-message-${message.id}`}
                    >
                      ×
                    </button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="msg bot">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bubble">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your habit update... (e.g., 'Did 30 min meditation')"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
            data-testid="input-chat-message"
            autoFocus
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}