import { useRealtimeData } from "@/hooks/use-realtime-data";

export default function Dashboard() {
  const { habits, habitEntries, isLoading, isError } = useRealtimeData();

  if (isLoading) {
    return (
      <div className="h-full p-4 sm:p-6 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full p-4 sm:p-6 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-red-500">Failed to load dashboard data</div>
      </div>
    );
  }

  // Generate calendar heatmap data
  const generateCalendarData = (habitName: string) => {
    const days = Array.from({ length: 35 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (34 - i));
      
      const entries = habitEntries.filter(entry => {
        const habit = habits.find(h => h.id === entry.habitId);
        return habit?.name === habitName && 
               new Date(entry.date).toDateString() === date.toDateString();
      });
      
      return {
        date,
        value: entries.length,
        intensity: Math.min(entries.length / 3, 1) // Normalize to 0-1
      };
    });
    
    return days;
  };

  // Generate sleep bar chart data
  const generateSleepData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const sleepEntries = habitEntries.filter(entry => {
        const habit = habits.find(h => h.id === entry.habitId);
        return habit?.name === 'sleep';
      });
      
      // Mock data for visualization
      return {
        day,
        hours: 6 + Math.random() * 3, // 6-9 hours
        percentage: (6 + Math.random() * 3) / 10 * 100
      };
    });
  };

  const codingHabit = habits.find(h => h.name === 'coding');
  const gymHabit = habits.find(h => h.name === 'gym');
  const calendarData = generateCalendarData('coding');
  const sleepData = generateSleepData();

  // Calculate gym progress
  const gymEntries = habitEntries.filter(entry => {
    const habit = habits.find(h => h.id === entry.habitId);
    return habit?.name === 'gym';
  });
  const gymProgress = Math.min((gymEntries.length / 10) * 100, 100); // Target: 10 sessions

  return (
    <div className="h-full p-4 sm:p-6 overflow-y-auto bg-background" data-testid="dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Coding Streak Calendar */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Coding Streak</h3>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {codingHabit?.currentStreak || 0} days current
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center font-medium">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`w-7 h-7 rounded-lg transition-all duration-200 hover:scale-110 ${
                  day.intensity === 0 
                    ? 'bg-muted' 
                    : `bg-accent`
                }`}
                style={{
                  opacity: day.intensity === 0 ? 1 : Math.max(0.3, day.intensity)
                }}
                title={`${day.date.toDateString()}: ${day.value} entries`}
              />
            ))}
          </div>
        </div>

        {/* Gym Progress Circle */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Gym Sessions</h3>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {gymEntries.length}/10 this week
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-accent"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${gymProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(gymProgress)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Tracking Bar Chart */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Sleep Tracking</h3>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">Last 7 days</div>
          </div>
          <div className="flex items-end justify-between space-x-3 h-40">
            {sleepData.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 flex-1">
                <div
                  className="bg-accent rounded-t-lg w-full transition-all duration-300 hover:bg-accent/80"
                  style={{ height: `${day.percentage}%` }}
                  title={`${day.day}: ${day.hours.toFixed(1)} hours`}
                />
                <div className="text-sm text-muted-foreground font-medium">{day.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
