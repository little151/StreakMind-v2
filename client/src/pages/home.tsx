import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import StatsHeader from "@/components/stats-header";
import ChatInterface from "@/components/chat-interface";
import Dashboard from "@/components/dashboard";
import ScoresHistory from "@/components/scores-history";
import Settings from "@/components/settings";

type Tab = 'chat' | 'dashboard' | 'scores' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isMobile, setIsMobile] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'dashboard':
        return <Dashboard />;
      case 'scores':
        return <ScoresHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-background" data-testid="main-layout">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsHeader user={user} />
        
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="flex justify-around py-2">
              {[
                { id: 'chat', icon: '💬', label: 'Chat' },
                { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                { id: 'scores', icon: '🏆', label: 'Scores' },
                { id: 'settings', icon: '⚙️', label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                    activeTab === item.id
                      ? 'text-accent'
                      : 'text-muted-foreground'
                  }`}
                  data-testid={`mobile-nav-${item.id}`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
