import React from "react";
import { TrendingUp } from "lucide-react";
import ActivityTile from "./activity-tile";

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
}

interface NewDashboardProps {
  stats: Stats | null;
}

export default function NewDashboard({ stats }: NewDashboardProps) {
  if (!stats) {
    return (
      <div className="h-full p-6 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Get unique activities and their data
  const activities = Object.keys(stats.streaks);
  
  // Calculate points per activity
  const getActivityPoints = (activity: string) => {
    return stats.logs
      .filter(log => log.activity === activity)
      .reduce((total, log) => total + log.points, 0);
  };

  // Determine visualization type for each activity
  const getVisualizationType = (activity: string): 'calendar' | 'ring' | 'bar' => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('coding') || activityLower.includes('code')) return 'calendar';
    if (activityLower.includes('gym') || activityLower.includes('workout')) return 'ring';
    return 'bar';
  };

  return (
    <div className="h-full p-4 sm:p-6 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Habits</h2>
            <p className="text-muted-foreground">Track your progress across all activities</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{stats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>

        {/* Activity Tiles Grid */}
        {activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {activities.map(activity => (
              <ActivityTile
                key={activity}
                activity={activity}
                streak={stats.streaks[activity] || 0}
                recentLogs={stats.logs}
                totalPoints={getActivityPoints(activity)}
                visualization={getVisualizationType(activity)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">Start by chatting about your activities or creating new habits</p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {Object.values(stats.streaks).filter(s => s > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Streaks</div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.max(...Object.values(stats.streaks), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.badges.length}
            </div>
            <div className="text-sm text-muted-foreground">Badges</div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.logs.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Logs</div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        {stats.logs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {stats.logs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <span className="text-sm">
                          {log.activity === 'coding' ? '💻' : 
                           log.activity === 'gym' ? '💪' : 
                           log.activity === 'sleep' ? '😴' : 
                           log.activity === 'reading' ? '📚' : 
                           log.activity === 'meditation' ? '🧘' : '⭐'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground capitalize">
                          {log.activity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.amount} {log.unit} • {new Date(log.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-accent font-medium">
                      +{log.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}