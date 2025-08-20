import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface StatsHeaderProps {
  user?: User;
}

export default function StatsHeader({ user }: StatsHeaderProps) {
  const { data: userBadges } = useQuery({
    queryKey: ['/api/user-badges'],
  });

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4" data-testid="stats-header">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Personal Habit Tracker</h1>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent" data-testid="total-points">
              {user?.totalPoints || 0}
            </div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="current-streak">
              {user?.currentStreak || 0}
            </div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500" data-testid="badges-count">
              {userBadges?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
