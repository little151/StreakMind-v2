import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";

export interface AppSettings {
  showScores: boolean;
  enabledPersonalities: {
    therapist: boolean;
    friend: boolean;
    trainer: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  notifications: {
    streakReminders: boolean;
    dailyGoals: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    defaultVisualization: 'heatmap' | 'bar' | 'progress' | 'pie';
    timeFormat: '12h' | '24h';
    startWeekOn: 'sunday' | 'monday';
  };
}

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ['/api/settings'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: async (updates: Partial<AppSettings>) => {
      const response = await apiRequest('PUT', '/api/settings', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useResetSettings() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/settings/reset');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}