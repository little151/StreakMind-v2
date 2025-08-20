import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface StatsHeaderProps {
  user?: User;
}

export default function StatsHeader({ user }: StatsHeaderProps) {
  const { data: userBadges = [] } = useQuery({
    queryKey: ['/api/user-badges'],
  });

  return (
    <div className="bg-card border-b border-border px-6 py-6" data-testid="stats-header">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">StreakMind Dashboard</h1>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent" data-testid="total-points">
              {user?.totalPoints || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="current-streak">
              {user?.currentStreak || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="badges-count">
              {Array.isArray(userBadges) ? userBadges.length : 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
