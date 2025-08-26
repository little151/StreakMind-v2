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

interface NewScoresProps {
  stats: Stats | null;
}

export default function NewScores({ stats }: NewScoresProps) {
  if (!stats) {
    return (
      <div className="h-full p-6 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading scores...</div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 sm:p-6 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Points & Scoring Rules */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Points & Scoring</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Point Values</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coding (per question)</span>
                  <span className="text-accent font-medium">5 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coding (per 5 minutes)</span>
                  <span className="text-accent font-medium">1 pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gym session</span>
                  <span className="text-accent font-medium">10 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sleep (per hour)</span>
                  <span className="text-accent font-medium">1 pt</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-3">Streak Rules</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Streaks increment once per calendar day</div>
                <div>• Multiple logs per day don't increase streak</div>
                <div>• Missing a day resets the streak to 0</div>
                <div>• Use "yesterday" to log for previous day</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Badges</h3>
          
          {stats.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <div className="font-medium text-foreground">{badge.name}</div>
                    <div className="text-sm text-muted-foreground">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-muted-foreground">
                No badges yet. Keep building streaks to earn them!
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Badge milestones: 3, 7, 14, and 30-day streaks
              </div>
            </div>
          )}
        </div>

        {/* Current Streaks */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Current Streaks</h3>
          
          {Object.keys(stats.streaks).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.streaks).map(([activity, count]) => (
                <div key={activity} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-accent">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{activity}</div>
                  <div className="text-xs text-muted-foreground">days</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No active streaks. Start logging activities to build streaks!
            </div>
          )}
        </div>

        {/* Recent Activity History */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
          
          {stats.logs.length > 0 ? (
            <div className="space-y-3">
              {stats.logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground capitalize">
                        {log.activity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.amount} {log.unit} • {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-accent">+{log.points}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity logged yet. Start chatting to track your habits!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}