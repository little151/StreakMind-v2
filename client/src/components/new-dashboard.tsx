import { useState, useEffect } from "react";

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

  // Generate calendar heatmap data for coding
  const generateCalendarData = () => {
    const days = Array.from({ length: 35 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (34 - i));
      
      const codingLogs = stats.logs.filter(log => 
        log.activity === 'coding' && 
        new Date(log.date).toDateString() === date.toDateString()
      );
      
      return {
        date,
        value: codingLogs.length,
        intensity: Math.min(codingLogs.length / 3, 1)
      };
    });
    
    return days;
  };

  // Generate gym progress
  const generateGymProgress = () => {
    const gymLogs = stats.logs.filter(log => log.activity === 'gym');
    const progress = Math.min((gymLogs.length / 10) * 100, 100); // Target: 10 sessions
    return progress;
  };

  // Generate sleep data
  const generateSleepData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      hours: 6 + Math.random() * 3, // Mock data for visualization
      percentage: (6 + Math.random() * 3) / 10 * 100
    }));
  };

  const calendarData = generateCalendarData();
  const gymProgress = generateGymProgress();
  const sleepData = generateSleepData();

  return (
    <div className="h-full p-4 sm:p-6 overflow-y-auto bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
        
        {/* Coding Streak Calendar */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Coding Streak</h3>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {stats.streaks.coding || 0} days current
            </div>
          </div>
          
          {/* Calendar Heatmap */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${
                  day.value === 0 
                    ? 'bg-muted' 
                    : day.intensity < 0.3 
                      ? 'bg-accent/30' 
                      : day.intensity < 0.7 
                        ? 'bg-accent/60' 
                        : 'bg-accent'
                }`}
                title={`${day.date.toDateString()}: ${day.value} sessions`}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <div className="w-3 h-3 bg-accent/30 rounded-sm" />
              <div className="w-3 h-3 bg-accent/60 rounded-sm" />
              <div className="w-3 h-3 bg-accent rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Gym Progress Ring */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Gym Progress</h3>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {stats.streaks.gym || 0} days streak
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="hsl(var(--accent))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${gymProgress * 2.51327} 251.327`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(gymProgress)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Target: 10 sessions
          </div>
        </div>

        {/* Sleep Bar Chart */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Sleep Pattern</h3>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {stats.streaks.sleep || 0} days tracked
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="space-y-3">
            {sleepData.map((day, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 text-xs text-muted-foreground font-medium">
                  {day.day}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${day.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground w-8 text-right">
                  {day.hours.toFixed(1)}h
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Target: 8 hours per night
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
          
          <div className="space-y-3">
            {stats.logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <div>
                    <div className="text-sm font-medium text-foreground capitalize">
                      {log.activity}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.amount} {log.unit}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-accent">
                    +{log.points}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {stats.logs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activity yet. Start logging your habits!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}