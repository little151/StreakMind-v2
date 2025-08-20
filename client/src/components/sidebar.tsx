import { ChartLine, MessageCircle, BarChart3, Trophy, Settings } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'chat' | 'dashboard' | 'scores' | 'settings') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'scores', icon: Trophy, label: 'Scores' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-16 lg:w-64 bg-card border-r border-border flex-shrink-0" data-testid="sidebar">
      <div className="p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <ChartLine className="h-6 w-6 text-accent-foreground" />
          </div>
          <span className="ml-3 font-bold text-foreground hidden lg:block">StreakMind</span>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as any)}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl w-full transition-all ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
