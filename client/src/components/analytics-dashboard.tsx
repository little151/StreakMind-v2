import React, { useMemo } from "react";
import { TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { format, parseISO, subDays, startOfDay } from "date-fns";

interface AnalyticsProps {
  stats: {
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
    activities: Record<string, {
      id: string;
      name: string;
      customPoints?: number;
      createdAt: string;
      description?: string;
      visualizationType: 'heatmap' | 'bar' | 'progress' | 'pie';
    }>;
  } | null;
}

export default function AnalyticsDashboard({ stats }: AnalyticsProps) {
  const chartConfig = {
    activity: {
      label: "Activities",
      color: "hsl(var(--chart-1))",
    },
    points: {
      label: "Points",
      color: "hsl(var(--chart-2))",
    },
    streak: {
      label: "Streak",
      color: "hsl(var(--chart-3))",
    },
  };

  // Chat Activity Trends - Messages per day over last 30 days
  const activityTrendsData = useMemo(() => {
    if (!stats?.logs) return [];
    
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'MM/dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        activities: 0,
        points: 0
      };
    });

    stats.logs.forEach(log => {
      const logDate = log.date;
      const dayData = last30Days.find(day => day.fullDate === logDate);
      if (dayData) {
        dayData.activities += 1;
        dayData.points += log.points;
      }
    });

    return last30Days;
  }, [stats?.logs]);

  // Activity Goals Progress - Compare activity frequency
  const activityProgressData = useMemo(() => {
    if (!stats?.logs || !stats?.activities) return [];
    
    const activityCounts: Record<string, { actual: number; target: number; name: string }> = {};
    
    // Count actual activities in last 7 days
    const last7Days = subDays(new Date(), 7);
    stats.logs.forEach(log => {
      const logDate = parseISO(log.timestamp);
      if (logDate >= last7Days) {
        if (!activityCounts[log.activity]) {
          activityCounts[log.activity] = {
            actual: 0,
            target: 7, // Assume target of 1 per day
            name: log.activity
          };
        }
        activityCounts[log.activity].actual += 1;
      }
    });

    return Object.values(activityCounts).map(activity => ({
      name: activity.name,
      actual: activity.actual,
      target: activity.target,
      progress: Math.round((activity.actual / activity.target) * 100)
    }));
  }, [stats?.logs, stats?.activities]);

  // Streak Performance Data
  const streakData = useMemo(() => {
    if (!stats?.streaks) return [];
    
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return Object.entries(stats.streaks).map(([activity, streak], index) => ({
      name: activity,
      value: streak,
      color: colors[index % colors.length]
    }));
  }, [stats?.streaks]);

  if (!stats) {
    return (
      <div className="h-full p-6 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-accent" />
              Analytics Dashboard
            </h2>
            <p className="text-muted-foreground">Insights into your habit tracking progress</p>
          </div>
        </div>

        {/* Activity Trends Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Daily Activity Trends</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Track your activity logging patterns over the last 30 days
          </p>
          
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={activityTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="activities" 
                stroke="var(--color-activity)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-activity)", strokeWidth: 2 }}
                name="Activities"
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="var(--color-points)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-points)", strokeWidth: 2 }}
                name="Points"
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Activity Goals Progress */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Weekly Goals Progress</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Compare your actual activity against target goals (7 days target)
          </p>
          
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={activityProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="actual" 
                fill="var(--color-activity)" 
                name="Actual"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="target" 
                fill="var(--color-points)" 
                name="Target"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Current Streaks */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Current Streaks</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Your current streak performance across all activities
          </p>
          
          {streakData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <PieChart>
                    <Pie
                      data={streakData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {streakData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
              
              {/* Streak List */}
              <div className="space-y-3">
                {streakData.map((streak, index) => (
                  <div 
                    key={streak.name} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: streak.color }}
                      />
                      <span className="font-medium text-foreground capitalize">
                        {streak.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">
                        {streak.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {streak.value === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No streak data available</div>
              <div className="text-xs text-muted-foreground mt-1">
                Start logging activities to build your streaks!
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{stats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points Earned</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{stats.logs.length}</div>
            <div className="text-sm text-muted-foreground">Total Activities Logged</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{Object.keys(stats.activities).length}</div>
            <div className="text-sm text-muted-foreground">Activity Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}