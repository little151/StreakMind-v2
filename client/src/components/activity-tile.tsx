import React, { useState } from "react";
import { Trophy, Zap, Calendar, TrendingUp, Edit, Trash2 } from "lucide-react";

interface ActivityTileProps extends React.HTMLAttributes<HTMLDivElement> {
  activity: string;
  streak: number;
  recentLogs: Array<{
    id: string;
    activity: string;
    amount: number;
    unit: string;
    date: string;
    points: number;
    timestamp: string;
  }>;
  totalPoints: number;
  visualization: 'heatmap' | 'bar' | 'progress' | 'pie';
  customPoints?: number;
  onEdit?: (activity: string) => void;
  onDelete?: (activity: string) => void;
}

export default function ActivityTile({ 
  activity, 
  streak, 
  recentLogs, 
  totalPoints,
  visualization,
  customPoints,
  onEdit,
  onDelete,
  style,
  className,
  ...rest
}: ActivityTileProps) {
  const [showActions, setShowActions] = useState(false);
  const activityLogs = recentLogs.filter(log => log.activity === activity);
  const todayLogs = activityLogs.filter(log => {
    const today = new Date().toISOString().split('T')[0];
    return log.date === today;
  });
  
  const getActivityIcon = (activity: string) => {
    switch (activity.toLowerCase()) {
      case 'coding':
      case 'code':
        return '💻';
      case 'gym':
      case 'workout':
      case 'exercise':
        return '💪';
      case 'sleep':
        return '😴';
      case 'reading':
      case 'read':
        return '📚';
      case 'meditation':
      case 'meditate':
        return '🧘';
      default:
        return '⭐';
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-blue-500';
    if (streak >= 7) return 'text-green-500';
    if (streak >= 3) return 'text-yellow-500';
    return 'text-gray-400';
  };

  const generateCalendarData = () => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      
      const dayLogs = activityLogs.filter(log => 
        new Date(log.date).toDateString() === date.toDateString()
      );
      
      return {
        date,
        hasActivity: dayLogs.length > 0,
        intensity: Math.min(dayLogs.length / 2, 1)
      };
    });
    return days;
  };

  const generateProgressData = () => {
    if (activityLogs.length === 0) return 0;
    
    // Calculate progress based on recent activity
    const last30Days = activityLogs.filter(log => {
      const logDate = new Date(log.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return logDate >= thirtyDaysAgo;
    });
    
    return Math.min((last30Days.length / 20) * 100, 100); // Target: 20 sessions in 30 days
  };

  const renderVisualization = () => {
    switch (visualization) {
      case 'heatmap':
        const calendarData = generateCalendarData();
        return (
          <div className="flex gap-1 mt-3">
            {calendarData.map((day, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${
                  day.hasActivity 
                    ? 'bg-accent' 
                    : 'bg-muted/40'
                }`}
                title={day.date.toDateString()}
              />
            ))}
          </div>
        );
      
      case 'progress':
        const progress = generateProgressData();
        return (
          <div className="relative w-16 h-16 mt-3 mx-auto">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted stroke-current"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent stroke-current"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {Math.round(progress)}%
            </div>
          </div>
        );
      
      case 'bar':
        const barProgress = generateProgressData();
        return (
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300" 
                style={{ width: `${barProgress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {Math.round(barProgress)}% of target
            </div>
          </div>
        );

      case 'pie':
        const pieProgress = generateProgressData();
        const remaining = 100 - pieProgress;
        const radius = 20;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = `${(pieProgress / 100) * circumference} ${circumference}`;
        
        return (
          <div className="mt-3 flex items-center justify-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="text-accent transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
                {Math.round(pieProgress)}%
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={`bg-card rounded-xl shadow-sm border border-border p-4 hover:shadow-md transition-all duration-300 hover:border-accent/20 card-hover group activity-tile-enter hover:scale-[1.02] ${className || ''}`}
      style={style}
      data-testid={`tile-${activity}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getActivityIcon(activity)}</span>
          <div className="flex flex-col">
            <span className="font-medium text-foreground capitalize">{activity}</span>
            {customPoints && (
              <span className="text-xs text-accent border border-accent/20 rounded px-2 py-1 w-fit mt-1">
                {customPoints} pts/session
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {todayLogs.length > 0 && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Logged today" />
          )}
          {showActions && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="h-8 w-8 p-0 rounded hover:bg-accent/20 flex items-center justify-center"
                onClick={() => onEdit?.(activity)}
                data-testid={`button-edit-${activity}`}
                title="Edit activity"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                className="h-8 w-8 p-0 rounded hover:bg-destructive/20 hover:text-destructive flex items-center justify-center"
                onClick={() => onDelete?.(activity)}
                data-testid={`button-delete-${activity}`}
                title="Delete activity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className={`text-lg font-bold ${getStreakColor(streak)}`}>
            {streak}
          </div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent">
            {totalPoints}
          </div>
          <div className="text-xs text-muted-foreground">Points</div>
        </div>
      </div>

      {/* Visualization */}
      {renderVisualization()}

      {/* Recent Activity Summary */}
      {todayLogs.length > 0 && (
        <div className="mt-3 p-2 bg-accent/10 rounded-lg">
          <div className="text-xs text-muted-foreground">Today</div>
          <div className="text-sm font-medium text-foreground">
            {todayLogs.reduce((total, log) => total + log.amount, 0)} {todayLogs[0]?.unit || 'sessions'}
          </div>
        </div>
      )}
    </div>
  );
}