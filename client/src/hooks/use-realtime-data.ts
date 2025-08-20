import { useQuery } from "@tanstack/react-query";
import type { User, Habit, HabitEntry } from "@shared/schema";

// Custom hook for real-time data management
export function useRealtimeData() {
  const userQuery = useQuery<User>({
    queryKey: ['/api/user'],
    staleTime: 0, // Always consider data stale for real-time updates
  });

  const habitsQuery = useQuery<Habit[]>({
    queryKey: ['/api/habits'],
    staleTime: 0,
  });

  const habitEntriesQuery = useQuery<HabitEntry[]>({
    queryKey: ['/api/habit-entries'],
    staleTime: 0,
  });

  const userBadgesQuery = useQuery({
    queryKey: ['/api/user-badges'],
    staleTime: 0,
  });

  return {
    user: userQuery.data,
    habits: habitsQuery.data || [],
    habitEntries: habitEntriesQuery.data || [],
    userBadges: userBadgesQuery.data || [],
    isLoading: userQuery.isLoading || habitsQuery.isLoading || habitEntriesQuery.isLoading,
    isError: userQuery.isError || habitsQuery.isError || habitEntriesQuery.isError,
    refetchAll: () => {
      userQuery.refetch();
      habitsQuery.refetch();
      habitEntriesQuery.refetch();
      userBadgesQuery.refetch();
    }
  };
}