import { useQuery } from "@tanstack/react-query";
import { Code2, Dumbbell, Moon, Flame } from "lucide-react";
import type { HabitEntry, Habit } from "@shared/schema";

export default function ScoresHistory() {
  const { data: userBadges = [] } = useQuery({
    queryKey: ['/api/user-badges'],
  });

  const { data: habitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ['/api/habit-entries', { limit: 10 }],
  });

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'fas fa-fire':
        return Flame;
      case 'fas fa-code':
        return Code2;
      case 'fas fa-dumbbell':
        return Dumbbell;
      case 'fas fa-moon':
        return Moon;
      default:
        return Flame;
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'coding':
        return Code2;
      case 'fitness':
        return Dumbbell;
      case 'sleep':
        return Moon;
      default:
        return Code2;
    }
  };

  const getActivityColor = (category: string) => {
    switch (category) {
      case 'coding':
        return 'bg-accent';
      case 'fitness':
        return 'bg-green-500';
      case 'sleep':
        return 'bg-blue-500';
      default:
        return 'bg-accent';
    }
  };

  const recentActivities = habitEntries
    .slice(0, 5)
    .map(entry => {
      const habit = habits.find(h => h.id === entry.habitId);
      return {
        ...entry,
        habit,
      };
    })
    .filter(activity => activity.habit);

  return (
    <div className="h-full p-6 overflow-y-auto" data-testid="scores-history">
      <div className="max-w-4xl mx-auto">
        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges Earned</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userBadges.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No badges earned yet!</p>
                <p className="text-sm mt-2">Keep tracking your habits to unlock badges.</p>
              </div>
            ) : (
              userBadges.map((userBadge: any) => {
                const IconComponent = getBadgeIcon(userBadge.badge?.icon);
                const colorClass = getBadgeColor(userBadge.badge?.color);
                
                return (
                  <div key={userBadge.id} className="text-center">
                    <div className={`w-16 h-16 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {userBadge.badge?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userBadge.badge?.description}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity!</p>
                <p className="text-sm mt-2">Start tracking your habits in the Chat tab.</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.habit?.category || '');
                const colorClass = getActivityColor(activity.habit?.category || '');
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {activity.habit?.name} {activity.habit?.category === 'coding' ? 'Practice' : activity.habit?.category === 'fitness' ? 'Session' : 'Tracking'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.value} {activity.habit?.category === 'coding' ? 'problems' : activity.habit?.category === 'fitness' ? 'session' : 'hours'} completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${colorClass === 'bg-accent' ? 'text-accent' : colorClass === 'bg-green-500' ? 'text-green-500' : 'text-blue-500'}`}>
                        +{activity.points} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
