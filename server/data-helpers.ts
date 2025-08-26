import fs from "fs";
import { randomUUID } from "crypto";

const DATA_FILE = "./server/data.json";

// Data structure interface
export interface LogEntry {
  id: string;
  activity: string;
  amount: number;
  unit: string;
  date: string; // YYYY-MM-DD format
  message: string;
  timestamp: string;
  points: number;
}

export interface AppData {
  logs: LogEntry[];
  scores: Array<{ id: string; points: number; timestamp: string }>;
  visualizations: Record<string, any>;
  streaks: Record<string, number>;
}

// Helper functions for data management
export function loadData(): AppData {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return {
      logs: data.logs || [],
      scores: data.scores || [],
      visualizations: data.visualizations || {},
      streaks: data.streaks || {}
    };
  } catch {
    return { 
      logs: [], 
      scores: [], 
      visualizations: {}, 
      streaks: {} 
    };
  }
}

export function saveData(data: AppData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Parse natural language habit messages
export function parseLogIntent(message: string): { 
  activity: string; 
  amount: number; 
  unit: string; 
  date: string;
} | null {
  const text = message.toLowerCase().trim();
  const today = new Date();
  let targetDate = today;

  // Check for "yesterday" intent
  if (text.includes('yesterday')) {
    targetDate = new Date(today);
    targetDate.setDate(today.getDate() - 1);
  }

  const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Coding patterns
  if (text.includes('coding') || text.includes('dsa') || text.includes('code') || 
      text.includes('leetcode') || text.includes('problems') || text.includes('algorithm')) {
    
    // Look for questions/problems
    const questionMatch = text.match(/(\d+)\s*(?:coding|leetcode|algorithm|dsa)?\s*(?:problems?|questions?|challenges?)/);
    if (questionMatch) {
      return { activity: 'coding', amount: parseInt(questionMatch[1]), unit: 'questions', date: dateStr };
    }
    
    // Look for minutes
    const minuteMatch = text.match(/(?:coded|coding)\s*(?:for\s*)?(\d+)\s*(?:minutes?|mins?)/);
    if (minuteMatch) {
      return { activity: 'coding', amount: parseInt(minuteMatch[1]), unit: 'minutes', date: dateStr };
    }

    // Default coding entry
    return { activity: 'coding', amount: 1, unit: 'session', date: dateStr };
  }

  // Gym patterns
  if (text.includes('gym') || text.includes('workout') || text.includes('exercise')) {
    return { activity: 'gym', amount: 1, unit: 'session', date: dateStr };
  }

  // Sleep patterns
  if (text.includes('sleep') || text.includes('slept')) {
    const match = text.match(/(?:slept|sleep)\s*(?:for\s*)?(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/);
    return { 
      activity: 'sleep', 
      amount: match ? parseFloat(match[1]) : 8, 
      unit: 'hours', 
      date: dateStr 
    };
  }

  return null;
}

// Calculate points for activities
export function calculatePoints(activity: string, amount: number, unit: string): number {
  switch (activity) {
    case 'coding':
      if (unit === 'questions') return amount * 5; // 5 points per question
      if (unit === 'minutes') return Math.floor(amount / 5); // 1 point per 5 minutes
      return 10; // Default session points
    case 'gym':
      return 10; // 10 points per gym session
    case 'sleep':
      return amount; // 1 point per hour of sleep
    default:
      return 5; // Default points
  }
}

// Check if streak should be incremented
export function shouldIncrementStreak(data: AppData, activity: string, date: string): boolean {
  // Check if there's already a log for this activity on this date
  return !data.logs.some(log => log.activity === activity && log.date === date);
}

// Calculate badges based on current streaks
export function calculateBadges(streaks: Record<string, number>): Array<{ name: string; icon: string; description: string }> {
  const badges: Array<{ name: string; icon: string; description: string }> = [];
  
  Object.entries(streaks).forEach(([activity, count]) => {
    if (count >= 30) {
      badges.push({ name: `${activity} Champion`, icon: '🏆', description: '30-day streak!' });
    } else if (count >= 14) {
      badges.push({ name: `${activity} Medal`, icon: '🏅', description: '14-day streak!' });
    } else if (count >= 7) {
      badges.push({ name: `${activity} Glow`, icon: '🌟', description: '7-day streak!' });
    } else if (count >= 3) {
      badges.push({ name: `${activity} Spark`, icon: '🔥', description: '3-day streak!' });
    }
  });
  
  return badges;
}