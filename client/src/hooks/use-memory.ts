import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";

export interface UserMemory {
  id: string;
  name?: string;
  preferences: {
    preferredActivities: string[];
    timeOfDay: string;
    personalityPreference: 'therapist' | 'friend' | 'trainer' | 'adaptive';
    motivationStyle: 'gentle' | 'encouraging' | 'intense';
  };
  personalContext: {
    goals: string[];
    challenges: string[];
    achievements: string[];
    recurringPatterns: string[];
  };
  conversationContext: {
    lastSession: string;
    commonTopics: string[];
    strugglingWith: string[];
    celebrating: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export function useMemory() {
  return useQuery<UserMemory>({
    queryKey: ['/api/memory'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useClearMemory() {
  return useMutation({
    mutationFn: async (fields: string[]) => {
      const response = await apiRequest('POST', '/api/memory/clear', { fields });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory'] });
    },
  });
}

export function useRemoveMemoryItem() {
  return useMutation({
    mutationFn: async ({ category, item }: { category: string; item: string }) => {
      const response = await apiRequest('POST', '/api/memory/remove-item', { category, item });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memory'] });
    },
  });
}