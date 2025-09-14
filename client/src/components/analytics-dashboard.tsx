import React, { useMemo } from "react";
import { TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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
    <div className="h-full p-3 sm:p-4 md:p-6 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Analytics Dashboard
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Insights into your habit tracking progress</p>
          </div>
        </div>

        {/* Activity Trends Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Daily Activity Trends</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Track your activity logging patterns over the last 30 days
          </p>
          
          <div className="w-full h-64 sm:h-80 md:h-96">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityTrendsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="var(--color-activity)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-activity)", strokeWidth: 2, r: 3 }}
                    name="Activities"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="var(--color-points)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-points)", strokeWidth: 2, r: 3 }}
                    name="Points"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Activity Goals Progress */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Weekly Goals Progress</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Compare your actual activity against target goals (7 days target)
          </p>
          
          <div className="w-full h-64 sm:h-80 md:h-96">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityProgressData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
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
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Current Streaks */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Current Streaks</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
            Your current streak performance across all activities
          </p>
          
          {streakData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Pie Chart */}
              <div className="w-full">
                <div className="w-full h-64 sm:h-80">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={streakData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => window.innerWidth > 640 ? `${name}: ${value}` : value}
                          outerRadius={"70%"}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {streakData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              
              {/* Streak List */}
              <div className="space-y-2 sm:space-y-3">
                {streakData.map((streak, index) => (
                  <div 
                    key={streak.name} 
                    className="flex items-center justify-between p-2 sm:p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: streak.color }}
                      />
                      <span className="font-medium text-foreground capitalize text-sm sm:text-base truncate">
                        {streak.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base sm:text-lg font-bold text-accent">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-accent">{stats.totalPoints}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Points Earned</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-accent">{stats.logs.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Activities Logged</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-accent">{Object.keys(stats.activities).length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Activity Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}