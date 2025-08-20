import { useQuery } from "@tanstack/react-query";
import type { Habit, HabitEntry } from "@shared/schema";

export default function Dashboard() {
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
  });

  const { data: habitEntries = [] } = useQuery<HabitEntry[]>({
    queryKey: ['/api/habit-entries'],
  });

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
    <div className="h-full p-6 overflow-y-auto" data-testid="dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coding Streak Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Coding Streak</h3>
            <div className="text-sm text-gray-500">
              {codingHabit?.currentStreak || 0} days current
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded ${
                  day.intensity === 0 
                    ? 'bg-gray-100' 
                    : `bg-accent`
                }`}
                style={{
                  opacity: day.intensity === 0 ? 1 : Math.max(0.2, day.intensity)
                }}
                title={`${day.date.toDateString()}: ${day.value} entries`}
              />
            ))}
          </div>
        </div>

        {/* Gym Progress Circle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gym Sessions</h3>
            <div className="text-sm text-gray-500">
              {gymEntries.length}/10 this week
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-accent"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${gymProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(gymProgress)}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Tracking Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sleep Tracking</h3>
            <div className="text-sm text-gray-500">Last 7 days</div>
          </div>
          <div className="flex items-end justify-between space-x-2 h-32">
            {sleepData.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div
                  className="bg-accent rounded-t w-full transition-all duration-300"
                  style={{ height: `${day.percentage}%` }}
                  title={`${day.day}: ${day.hours.toFixed(1)} hours`}
                />
                <div className="text-xs text-gray-500">{day.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
