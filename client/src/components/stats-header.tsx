import { useRealtimeData } from "@/hooks/use-realtime-data";
import type { User } from "@shared/schema";
import InfoModal from "./info-modal";

interface StatsHeaderProps {
  user?: User;
}

export default function StatsHeader({ user: propUser }: StatsHeaderProps) {
  const { user: realtimeUser, userBadges } = useRealtimeData();
  
  // Use realtime user data if available, otherwise fall back to prop
  const user = realtimeUser || propUser;

  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-4 sm:py-6" data-testid="stats-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">StreakMind</h1>
          <InfoModal />
        </div>
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-accent" data-testid="total-points">
              {user?.totalPoints || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-foreground" data-testid="current-streak">
              {user?.currentStreak || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-foreground" data-testid="badges-count">
              {Array.isArray(userBadges) ? userBadges.length : 0}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
