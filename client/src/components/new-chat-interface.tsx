import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data: ChatResponse = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Refresh stats if data was updated
      if (data.logEntry) {
        await refreshStats();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process that message. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Chat Commands</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfoModal(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </Button>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Coding:</strong>
              <div className="ml-2">• "Did 2 coding questions"</div>
              <div className="ml-2">• "Coded for 30 minutes"</div>
            </div>
            <div>
              <strong className="text-foreground">Fitness:</strong>
              <div className="ml-2">• "Gym done"</div>
              <div className="ml-2">• "Workout complete"</div>
            </div>
            <div>
              <strong className="text-foreground">Sleep:</strong>
              <div className="ml-2">• "Slept 7 hours"</div>
            </div>
            <div>
              <strong className="text-foreground">Time:</strong>
              <div className="ml-2">• Add "yesterday" to log for previous day</div>
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
        <h2 className="text-lg font-semibold text-foreground">Chat</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInfoModal(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Info className="h-4 w-4" />
        </Button>
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
              className={`msg ${message.isUser ? 'user' : 'bot'}`}
            >
              <div className="flex items-start gap-3 max-w-[80%]">
                {!message.isUser && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="bubble">
                  {message.content}
                </div>
                {message.isUser && (
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
            type="text"
            placeholder="Type your habit update... (e.g., 'Did 30 min meditation')"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
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