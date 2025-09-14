import fs from "fs";
import { randomUUID } from "crypto";

const DATA_FILE = "./server/data.json";
const CHAT_FILE = "./server/chatData.json";
const MEMORY_FILE = "./server/memory.json";
const SETTINGS_FILE = "./server/settings.json";

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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

export interface UserMemory {
  id: string;
  name?: string;
  preferences: {
    preferredActivities: string[];
    timeOfDay: string; // morning, afternoon, evening
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

export interface Activity {
  id: string;
  name: string;
  customPoints?: number; // User can override default points
  createdAt: string;
  description?: string;
  visualizationType: 'heatmap' | 'bar' | 'progress' | 'pie';
}

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

export interface AppData {
  logs: LogEntry[];
  scores: Array<{ id: string; points: number; timestamp: string }>;
  visualizations: Record<string, any>;
  streaks: Record<string, number>;
  activities: Record<string, Activity>; // New: store activity metadata
}

// Settings management functions
export function loadSettings(): AppSettings {
  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    return {
      showScores: data.showScores ?? true,
      enabledPersonalities: data.enabledPersonalities ?? {
        therapist: true,
        friend: true,
        trainer: true,
      },
      theme: data.theme ?? 'dark',
      notifications: data.notifications ?? {
        streakReminders: true,
        dailyGoals: true,
        weeklyReports: false,
      },
      preferences: data.preferences ?? {
        defaultVisualization: 'heatmap',
        timeFormat: '24h',
        startWeekOn: 'monday',
      }
    };
  } catch {
    // Return default settings if file doesn't exist
    const defaultSettings: AppSettings = {
      showScores: true,
      enabledPersonalities: {
        therapist: true,
        friend: true,
        trainer: true,
      },
      theme: 'dark',
      notifications: {
        streakReminders: true,
        dailyGoals: true,
        weeklyReports: false,
      },
      preferences: {
        defaultVisualization: 'heatmap',
        timeFormat: '24h',
        startWeekOn: 'monday',
      }
    };
    saveSettings(defaultSettings);
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const currentSettings = loadSettings();
  const newSettings = { ...currentSettings, ...updates };
  
  // Deep merge for nested objects
  if (updates.enabledPersonalities) {
    newSettings.enabledPersonalities = { ...currentSettings.enabledPersonalities, ...updates.enabledPersonalities };
  }
  if (updates.notifications) {
    newSettings.notifications = { ...currentSettings.notifications, ...updates.notifications };
  }
  if (updates.preferences) {
    newSettings.preferences = { ...currentSettings.preferences, ...updates.preferences };
  }
  
  saveSettings(newSettings);
  return newSettings;
}

// Helper functions for data management
export function loadData(): AppData {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return {
      logs: data.logs || [],
      scores: data.scores || [],
      visualizations: data.visualizations || {},
      streaks: data.streaks || {},
      activities: data.activities || {}
    };
  } catch {
    return { 
      logs: [], 
      scores: [], 
      visualizations: {}, 
      streaks: {},
      activities: {}
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

// Calculate points for activities - enhanced with custom points support
export function calculatePoints(activity: string, amount: number, unit: string, data: AppData): number {
  // Check if user has set custom points for this activity
  const activityData = data.activities[activity];
  if (activityData && activityData.customPoints !== undefined) {
    return activityData.customPoints * amount;
  }

  // Use default point calculation
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

// Activity CRUD operations
export function createActivity(data: AppData, name: string, customPoints?: number): Activity {
  const activity: Activity = {
    id: randomUUID(),
    name,
    customPoints,
    createdAt: new Date().toISOString(),
    visualizationType: getVisualizationType(name)
  };
  
  data.activities[name] = activity;
  if (!data.streaks[name]) {
    data.streaks[name] = 0;
  }
  
  return activity;
}

export function updateActivity(data: AppData, oldName: string, updates: Partial<Activity>): boolean {
  const activity = data.activities[oldName];
  if (!activity) return false;
  
  // If renaming, update the key
  if (updates.name && updates.name !== oldName) {
    delete data.activities[oldName];
    data.activities[updates.name] = { ...activity, ...updates };
    
    // Update streaks key
    data.streaks[updates.name] = data.streaks[oldName] || 0;
    delete data.streaks[oldName];
    
    // Update logs
    data.logs.forEach(log => {
      if (log.activity === oldName) {
        log.activity = updates.name!;
      }
    });
  } else {
    data.activities[oldName] = { ...activity, ...updates };
  }
  
  return true;
}

export function deleteActivity(data: AppData, name: string): boolean {
  if (!data.activities[name]) return false;
  
  delete data.activities[name];
  delete data.streaks[name];
  
  // Remove logs for this activity
  data.logs = data.logs.filter(log => log.activity !== name);
  
  return true;
}

function getVisualizationType(activity: string): 'heatmap' | 'bar' | 'progress' | 'pie' {
  const activityLower = activity.toLowerCase();
  if (activityLower.includes('coding') || activityLower.includes('code')) return 'heatmap';
  if (activityLower.includes('gym') || activityLower.includes('workout')) return 'progress';
  if (activityLower.includes('sleep')) return 'bar';
  return 'pie';
}

// Enhanced chat command parsing for CRUD operations
export function parseCRUDCommand(message: string): {
  action: 'create' | 'update' | 'delete' | 'setpoints' | null;
  activity?: string;
  newName?: string;
  points?: number;
} {
  const text = message.toLowerCase().trim();
  
  // Delete commands
  if (text.includes('delete') || text.includes('remove')) {
    const deleteMatch = text.match(/(?:delete|remove)\s+(.+?)(?:\s+activity|\s+habit|$)/);
    if (deleteMatch) {
      return { action: 'delete', activity: deleteMatch[1].trim() };
    }
  }
  
  // Rename commands
  if (text.includes('rename') || text.includes('change name')) {
    const renameMatch = text.match(/(?:rename|change name of)\s+(.+?)\s+to\s+(.+)/);
    if (renameMatch) {
      return {
        action: 'update',
        activity: renameMatch[1].trim(),
        newName: renameMatch[2].trim()
      };
    }
  }
  
  // Set points commands
  if (text.includes('set points') || text.includes('points to')) {
    const pointsMatch = text.match(/set\s+(.+?)\s+(?:points\s+)?to\s+(\d+)/);
    if (pointsMatch) {
      return {
        action: 'setpoints',
        activity: pointsMatch[1].replace(/points|point/, '').trim(),
        points: parseInt(pointsMatch[2])
      };
    }
  }
  
  return { action: null };
}

// Chat data management functions
export function loadChatData(): ChatMessage[] {
  try {
    const data = JSON.parse(fs.readFileSync(CHAT_FILE, "utf8"));
    return data.messages || [];
  } catch {
    return [];
  }
}

export function saveChatData(messages: ChatMessage[]) {
  fs.writeFileSync(CHAT_FILE, JSON.stringify({ messages }, null, 2));
}

export function addChatMessage(message: ChatMessage): ChatMessage[] {
  const messages = loadChatData();
  messages.push(message);
  saveChatData(messages);
  return messages;
}

export function deleteChatMessage(messageId: string): ChatMessage[] {
  const messages = loadChatData();
  const filteredMessages = messages.filter(msg => msg.id !== messageId);
  saveChatData(filteredMessages);
  return filteredMessages;
}

export function clearAllChatMessages(): ChatMessage[] {
  saveChatData([]);
  return [];
}

// Memory management functions
export function loadMemory(): UserMemory {
  try {
    const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    return data;
  } catch {
    // Create default memory structure
    const defaultMemory: UserMemory = {
      id: randomUUID(),
      preferences: {
        preferredActivities: [],
        timeOfDay: 'adaptive',
        personalityPreference: 'adaptive',
        motivationStyle: 'encouraging'
      },
      personalContext: {
        goals: [],
        challenges: [],
        achievements: [],
        recurringPatterns: []
      },
      conversationContext: {
        lastSession: new Date().toISOString(),
        commonTopics: [],
        strugglingWith: [],
        celebrating: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveMemory(defaultMemory);
    return defaultMemory;
  }
}

export function saveMemory(memory: UserMemory) {
  memory.updatedAt = new Date().toISOString();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

export function updateMemoryFromMessage(message: string, isUserMessage: boolean): UserMemory {
  const memory = loadMemory();
  
  if (!isUserMessage) return memory;
  
  const text = message.toLowerCase().trim();
  const now = new Date().toISOString();
  memory.conversationContext.lastSession = now;
  
  // Extract user name if mentioned
  const nameMatch = text.match(/my name is (\w+)|i'm (\w+)|call me (\w+)/);
  if (nameMatch) {
    memory.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
  }
  
  // Detect goals
  const goalPatterns = [
    /want to (\w+)/,
    /goal is to (\w+)/,
    /trying to (\w+)/,
    /hope to (\w+)/
  ];
  
  goalPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && !memory.personalContext.goals.includes(match[1])) {
      memory.personalContext.goals.push(match[1]);
    }
  });
  
  // Detect challenges/struggles
  const challengeKeywords = ['struggle', 'hard time', 'difficult', 'tough', 'challenging', 'can\'t', 'problem'];
  challengeKeywords.forEach(keyword => {
    if (text.includes(keyword) && !memory.conversationContext.strugglingWith.includes(keyword)) {
      memory.conversationContext.strugglingWith.push(keyword);
    }
  });
  
  // Detect celebrations/achievements
  const celebrationKeywords = ['great', 'awesome', 'amazing', 'proud', 'accomplished', 'succeeded', 'nailed'];
  celebrationKeywords.forEach(keyword => {
    if (text.includes(keyword) && !memory.conversationContext.celebrating.includes(keyword)) {
      memory.conversationContext.celebrating.push(keyword);
    }
  });
  
  // Track preferred activities
  const currentActivities = Object.keys(loadData().streaks);
  currentActivities.forEach(activity => {
    if (text.includes(activity.toLowerCase()) && !memory.preferences.preferredActivities.includes(activity)) {
      memory.preferences.preferredActivities.push(activity);
    }
  });
  
  // Detect time preferences
  if (text.includes('morning')) memory.preferences.timeOfDay = 'morning';
  else if (text.includes('afternoon') || text.includes('lunch')) memory.preferences.timeOfDay = 'afternoon';
  else if (text.includes('evening') || text.includes('night')) memory.preferences.timeOfDay = 'evening';
  
  // Keep arrays reasonable size
  memory.conversationContext.strugglingWith = memory.conversationContext.strugglingWith.slice(-10);
  memory.conversationContext.celebrating = memory.conversationContext.celebrating.slice(-10);
  memory.preferences.preferredActivities = memory.preferences.preferredActivities.slice(-15);
  
  saveMemory(memory);
  return memory;
}

export function getMemoryContext(): string {
  const memory = loadMemory();
  
  let context = '';
  
  if (memory.name) {
    context += `User's name: ${memory.name}. `;
  }
  
  if (memory.preferences.preferredActivities.length > 0) {
    context += `Preferred activities: ${memory.preferences.preferredActivities.slice(-5).join(', ')}. `;
  }
  
  if (memory.personalContext.goals.length > 0) {
    context += `Goals: ${memory.personalContext.goals.slice(-3).join(', ')}. `;
  }
  
  if (memory.conversationContext.strugglingWith.length > 0) {
    context += `Recently struggling with: ${memory.conversationContext.strugglingWith.slice(-3).join(', ')}. `;
  }
  
  if (memory.conversationContext.celebrating.length > 0) {
    context += `Recently celebrating: ${memory.conversationContext.celebrating.slice(-3).join(', ')}. `;
  }
  
  return context.trim();
}