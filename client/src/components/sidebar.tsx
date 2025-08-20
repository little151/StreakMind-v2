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
    <div className="w-16 lg:w-64 bg-white border-r border-gray-200 flex-shrink-0" data-testid="sidebar">
      <div className="p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <ChartLine className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 font-bold text-gray-900 hidden lg:block">HabitChat</span>
        </div>
      </div>
      
      <nav className="mt-8">
        <div className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as any)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-gray-700 hover:bg-gray-100'
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
