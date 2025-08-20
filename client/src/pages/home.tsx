import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import StatsHeader from "@/components/stats-header";
import ChatInterface from "@/components/chat-interface";
import Dashboard from "@/components/dashboard";
import ScoresHistory from "@/components/scores-history";
import Settings from "@/components/settings";

type Tab = 'chat' | 'dashboard' | 'scores' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

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
    <div className="flex h-screen bg-gray-50" data-testid="main-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsHeader user={user} />
        
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
