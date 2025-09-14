import React, { useState, useEffect } from "react";
import { Sun, Moon, BarChart3, MessageSquare, Trophy, Settings, TrendingUp } from "lucide-react";
import { Button } from "./components/ui/button";
import NewChatInterface from "./components/new-chat-interface";
import NewDashboard from "./components/new-dashboard";
import NewScores from "./components/new-scores";
import AnalyticsDashboard from "./components/analytics-dashboard";
import SettingsModal from "./components/settings-modal";
// import { OfflineIndicator } from "./components/offline-indicator";
// import { useOffline } from "./contexts/offline-context";
import { useSettings } from "./hooks/use-settings";

interface Stats {
  totalPoints: number;
  streaks: Record<string, number>;
  badges: Array<{ name: string; icon: string; description: string }>;
  logs: Array<{
    id: string;
    activity: string;
    amount: number;
    unit: string;
    date: string;
    points: number;
    timestamp: string;
  }>;
  activities: Record<string, {
    id: string;
    name: string;
    customPoints?: number;
    createdAt: string;
    description?: string;
    visualizationType: 'heatmap' | 'bar' | 'progress' | 'pie';
  }>;
}

type Tab = 'chat' | 'dashboard' | 'scores' | 'analytics';

export default function App() {
  console.log('App component rendering...');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobile, setIsMobile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { data: settings, isLoading: settingsLoading } = useSettings();
  // const { isOnline } = useOffline();
  const showScores = settings?.showScores ?? true; // Default to true while loading

  // Initialize theme and mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Set dark theme as default
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // showScores is now managed by backend settings, no need for localStorage

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load initial stats
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleStatsUpdate = () => {
    fetchStats();
  };

  // Handle tab change when scores are hidden
  useEffect(() => {
    if (!showScores && activeTab === 'scores') {
      setActiveTab('dashboard');
    }
  }, [showScores, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <NewChatInterface onStatsUpdate={handleStatsUpdate} />;
      case 'dashboard':
        return <NewDashboard stats={stats} />;
      case 'scores':
        return <NewScores stats={stats} />;
      case 'analytics':
        return <AnalyticsDashboard stats={stats} />;
      default:
        return <NewChatInterface onStatsUpdate={handleStatsUpdate} />;
    }
  };

  console.log('App render - isLoading:', isLoading);
  
  if (isLoading) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
        <div>Loading StreakMind...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 bg-card border-r border-border flex-shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="font-bold text-foreground text-xl">StreakMind</span>
            </div>
          </div>
          
          <nav className="mt-4 px-3">
            <div className="space-y-2">
              {[
                { id: 'chat', icon: MessageSquare, label: 'Chat' },
                { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
                ...(showScores ? [{ id: 'scores', icon: Trophy, label: 'Scores' }] : []),
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl w-full transition-all ${
                      isActive
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Settings and Theme Toggle */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-open-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {isMobile && (
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                </div>
              )}
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                {isMobile ? 'StreakMind' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-8">
              {stats && showScores && (
                <>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-accent">
                      {stats.totalPoints}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">
                      {Math.max(...Object.values(stats.streaks), 0)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Best Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">
                      {stats.badges.length}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Badges</div>
                  </div>
                </>
              )}
              
              {/* Settings Button for Mobile */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-open-settings-mobile"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="border-t border-border bg-card">
            <div className="flex justify-around py-2">
              {[
                { id: 'chat', icon: '💬', label: 'Chat' },
                { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                { id: 'analytics', icon: '📈', label: 'Analytics' },
                ...(showScores ? [{ id: 'scores', icon: '🏆', label: 'Scores' }] : []),
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                    activeTab === item.id
                      ? 'text-accent'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span className="text-lg mb-1">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Settings Modal */}
        <SettingsModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
        
        {/* Offline Indicator */}
        {/* <OfflineIndicator /> */}
      </div>
    </div>
  );
}