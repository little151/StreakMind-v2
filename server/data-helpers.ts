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

// Parse natural language habit messages - enhanced for dynamic activities
export function parseLogIntent(message: string, existingActivities?: string[]): { 
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

  // Check for dynamic activities first (if we have a list of existing activities)
  if (existingActivities && existingActivities.length > 0) {
    for (const activity of existingActivities) {
      const activityLower = activity.toLowerCase();
      
      // Check if message mentions this activity
      if (text.includes(activityLower) || 
          text.includes(`did ${activityLower}`) || 
          text.includes(`completed ${activityLower}`) ||
          text.includes(`finished ${activityLower}`)) {
        
        // Look for numbers in the message
        const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
        const amount = numberMatch ? parseFloat(numberMatch[1]) : 1;
        
        // Determine unit based on context
        let unit = 'session';
        if (text.includes('minute') || text.includes('min')) unit = 'minutes';
        else if (text.includes('hour') || text.includes('hr')) unit = 'hours';
        else if (text.includes('page') || text.includes('chapter')) unit = 'pages';
        else if (text.includes('mile') || text.includes('km') || text.includes('step')) unit = 'distance';
        
        return { activity, amount, unit, date: dateStr };
      }
    }
  }

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

  // Reading patterns
  if (text.includes('read') || text.includes('reading')) {
    const pageMatch = text.match(/(\d+)\s*(?:pages?|chapters?)/);
    const minuteMatch = text.match(/(?:read|reading)\s*(?:for\s*)?(\d+)\s*(?:minutes?|mins?)/);
    
    if (pageMatch) {
      return { activity: 'reading', amount: parseInt(pageMatch[1]), unit: 'pages', date: dateStr };
    } else if (minuteMatch) {
      return { activity: 'reading', amount: parseInt(minuteMatch[1]), unit: 'minutes', date: dateStr };
    }
    return { activity: 'reading', amount: 1, unit: 'session', date: dateStr };
  }

  // Meditation patterns
  if (text.includes('meditat') || text.includes('mindful')) {
    const match = text.match(/(?:meditat|mindful)\w*\s*(?:for\s*)?(\d+)\s*(?:minutes?|mins?)/);
    return { 
      activity: 'meditation', 
      amount: match ? parseInt(match[1]) : 10, 
      unit: 'minutes', 
      date: dateStr 
    };
  }

  return null;
}

// Calculate points for activities - enhanced for dynamic activities
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
    case 'reading':
      if (unit === 'pages') return amount * 2; // 2 points per page
      if (unit === 'minutes') return Math.floor(amount / 10); // 1 point per 10 minutes
      return 8; // Default reading session
    case 'meditation':
      if (unit === 'minutes') return amount; // 1 point per minute
      return 10; // Default meditation session
    default:
      // For dynamic activities, use general scoring
      if (unit === 'minutes') return Math.floor(amount / 10); // 1 point per 10 minutes
      if (unit === 'hours') return amount * 10; // 10 points per hour
      if (unit === 'pages') return amount * 2; // 2 points per page
      return 5; // Default session points
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