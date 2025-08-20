import { Router } from "express";
import fs from "fs";
import { randomUUID } from "crypto";

const router = Router();
const DATA_FILE = "./server/data.json";

// Default user ID for demo purposes
const DEFAULT_USER_ID = "cf966abd-1a85-4221-8f8b-e82dafc26c15";

// Helper functions to read/write JSON data
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { users: {}, habits: {}, habitEntries: {}, messages: {}, badges: {}, userBadges: {} };
  }
}

function saveData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Helper function to parse natural language habit messages
function parseHabitMessage(content: string): { habitName: string; value: number; category: string } | null {
  const text = content.toLowerCase();
  
  // Coding patterns
  if (text.includes('coding') || text.includes('leetcode') || text.includes('problems') || text.includes('algorithm')) {
    const match = text.match(/(\d+)\s*(?:coding|leetcode|algorithm)?\s*(?:problems?|questions?|challenges?)/);
    return { habitName: 'coding', value: match ? parseInt(match[1]) : 1, category: 'coding' };
  }
  
  // Gym patterns
  if (text.includes('gym') || text.includes('workout') || text.includes('exercise')) {
    return { habitName: 'gym', value: 1, category: 'fitness' };
  }
  
  // Sleep patterns
  if (text.includes('sleep') || text.includes('slept')) {
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/);
    return { habitName: 'sleep', value: match ? parseFloat(match[1]) : 8, category: 'sleep' };
  }
  
  // Reading patterns
  if (text.includes('read') || text.includes('reading') || text.includes('book')) {
    const match = text.match(/(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/);
    return { habitName: 'reading', value: 1, category: 'learning' };
  }
  
  return null;
}

// Helper function to generate AI responses
function generateAIResponse(habitName: string, value: number, points: number): string {
  const responses = {
    coding: [
      `Coding master in action! ${value} problems solved. Keep that streak going! +${points} points.`,
      `Awesome coding session! ${value} challenges conquered. You're on fire! +${points} points.`,
      `Great job! ${value} problems down. Your coding skills are improving! +${points} points.`
    ],
    gym: [
      `Gym warrior! Another solid workout in the books. Stay strong! +${points} points.`,
      `Fitness goal achieved! You're building those healthy habits. +${points} points.`,
      `Great workout session! Your dedication is paying off. +${points} points.`
    ],
    sleep: [
      `Good sleep habits! ${value} hours of rest logged. Sweet dreams! +${points} points.`,
      `Rest and recovery tracked! ${value} hours of quality sleep. +${points} points.`,
      `Sleep goal achieved! ${value} hours will help you perform better tomorrow. +${points} points.`
    ],
    reading: [
      `Knowledge gained! Reading session completed. Keep learning! +${points} points.`,
      `Great reading habit! Your mind is growing stronger. +${points} points.`,
      `Reading milestone achieved! Expanding your knowledge pays off. +${points} points.`
    ]
  };
  
  const categoryResponses = responses[habitName as keyof typeof responses] || [
    `Habit tracked! Great job staying consistent. +${points} points.`
  ];
  
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

// User routes
router.get("/user", (req, res) => {
  const data = loadData();
  const user = data.users[DEFAULT_USER_ID];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

router.patch("/user", (req, res) => {
  const data = loadData();
  const user = data.users[DEFAULT_USER_ID];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const updatedUser = { ...user, ...req.body };
  data.users[DEFAULT_USER_ID] = updatedUser;
  saveData(data);
  res.json(updatedUser);
});

// Habit routes
router.get("/habits", (req, res) => {
  const data = loadData();
  const habits = Object.values(data.habits).filter((habit: any) => habit.userId === DEFAULT_USER_ID);
  res.json(habits);
});

router.post("/habits", (req, res) => {
  const data = loadData();
  const habitId = randomUUID();
  const habit = {
    id: habitId,
    ...req.body,
    userId: DEFAULT_USER_ID,
    createdAt: new Date().toISOString()
  };
  
  data.habits[habitId] = habit;
  saveData(data);
  res.json(habit);
});

// Habit entry routes
router.get("/habit-entries", (req, res) => {
  const data = loadData();
  const { habitId, limit } = req.query;
  
  let entries = Object.values(data.habitEntries).filter((entry: any) => entry.userId === DEFAULT_USER_ID);
  
  if (habitId) {
    entries = entries.filter((entry: any) => entry.habitId === habitId);
  }
  
  entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (limit) {
    entries = entries.slice(0, parseInt(limit as string));
  }
  
  res.json(entries);
});

router.post("/habit-entries", (req, res) => {
  const data = loadData();
  const entryId = randomUUID();
  const entry = {
    id: entryId,
    ...req.body,
    userId: DEFAULT_USER_ID,
    date: req.body.date || new Date().toISOString()
  };
  
  data.habitEntries[entryId] = entry;
  saveData(data);
  res.json(entry);
});

// Message routes
router.get("/messages", (req, res) => {
  const data = loadData();
  const { limit } = req.query;
  
  let messages = Object.values(data.messages).filter((message: any) => message.userId === DEFAULT_USER_ID);
  messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (limit) {
    messages = messages.slice(-parseInt(limit as string));
  }
  
  res.json(messages);
});

router.post("/messages", (req, res) => {
  const data = loadData();
  const { content } = req.body;
  
  // Create user message
  const userMessageId = randomUUID();
  const userMessage = {
    id: userMessageId,
    userId: DEFAULT_USER_ID,
    content,
    isFromUser: true,
    habitEntryId: null,
    timestamp: new Date().toISOString()
  };
  
  data.messages[userMessageId] = userMessage;

  // Parse habit from message
  const habitInfo = parseHabitMessage(content);
  let habitEntry = null;
  let aiMessage = null;

  if (habitInfo) {
    // Find or create habit
    const habits = Object.values(data.habits).filter((h: any) => h.userId === DEFAULT_USER_ID);
    let habit = habits.find((h: any) => h.name === habitInfo.habitName);
    
    if (!habit) {
      const habitId = randomUUID();
      habit = {
        id: habitId,
        name: habitInfo.habitName,
        category: habitInfo.category,
        userId: DEFAULT_USER_ID,
        pointsPerCompletion: habitInfo.category === 'coding' ? 20 : 
                            habitInfo.category === 'fitness' ? 30 : 10,
        visualizationType: 'calendar',
        currentStreak: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      data.habits[habitId] = habit;
    }

    // Calculate points
    const points = (habit as any).pointsPerCompletion * habitInfo.value;

    // Create habit entry
    const entryId = randomUUID();
    habitEntry = {
      id: entryId,
      userId: DEFAULT_USER_ID,
      habitId: (habit as any).id,
      value: habitInfo.value,
      points,
      date: new Date().toISOString(),
      metadata: { originalMessage: content }
    };
    
    data.habitEntries[entryId] = habitEntry;

    // Update user points
    const user = data.users[DEFAULT_USER_ID];
    if (user) {
      user.totalPoints = (user.totalPoints || 0) + points;
      user.currentStreak = (user.currentStreak || 0) + 1;
    }

    // Generate AI response
    const aiResponse = generateAIResponse(habitInfo.habitName, habitInfo.value, points);
    const aiMessageId = randomUUID();
    aiMessage = {
      id: aiMessageId,
      userId: DEFAULT_USER_ID,
      content: aiResponse,
      isFromUser: false,
      habitEntryId: entryId,
      timestamp: new Date().toISOString()
    };
    
    data.messages[aiMessageId] = aiMessage;
  } else {
    // Generic AI response for unrecognized messages
    const aiMessageId = randomUUID();
    aiMessage = {
      id: aiMessageId,
      userId: DEFAULT_USER_ID,
      content: "I didn't quite catch that habit. Try something like 'Did 3 coding questions today' or 'Went to gym for 1 hour'.",
      isFromUser: false,
      habitEntryId: null,
      timestamp: new Date().toISOString()
    };
    
    data.messages[aiMessageId] = aiMessage;
  }

  saveData(data);
  
  res.json({
    userMessage,
    aiMessage,
    habitEntry
  });
});

// Badge routes
router.get("/badges", (req, res) => {
  const data = loadData();
  const badges = Object.values(data.badges);
  res.json(badges);
});

router.get("/user-badges", (req, res) => {
  const data = loadData();
  const userBadges = Object.values(data.userBadges).filter((ub: any) => ub.userId === DEFAULT_USER_ID);
  res.json(userBadges);
});

router.post("/user-badges", (req, res) => {
  const data = loadData();
  const userBadgeId = randomUUID();
  const userBadge = {
    id: userBadgeId,
    ...req.body,
    userId: DEFAULT_USER_ID,
    earnedAt: new Date().toISOString()
  };
  
  data.userBadges[userBadgeId] = userBadge;
  saveData(data);
  res.json(userBadge);
});

export { router as apiRouter };