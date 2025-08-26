import { Router } from "express";
import { randomUUID } from "crypto";
import { openai } from "./index";
import {
  loadData,
  saveData,
  parseLogIntent,
  calculatePoints,
  shouldIncrementStreak,
  calculateBadges,
  type LogEntry,
  type AppData
} from "./data-helpers";

const router = Router();

// New chat endpoint with OpenAI integration
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is required" });
    }

    const data = loadData();
    const logIntent = parseLogIntent(message);
    
    let reply = "";
    let logEntry: LogEntry | null = null;
    let pointsAwarded = 0;
    let streakUpdated = false;

    if (logIntent) {
      // This is a logging intent
      const { activity, amount, unit, date } = logIntent;
      
      // Calculate points
      pointsAwarded = calculatePoints(activity, amount, unit);
      
      // Check if streak should be incremented
      const shouldIncrement = shouldIncrementStreak(data, activity, date);
      if (shouldIncrement) {
        data.streaks[activity] = (data.streaks[activity] || 0) + 1;
        streakUpdated = true;
      }
      
      // Create log entry
      logEntry = {
        id: randomUUID(),
        activity,
        amount,
        unit,
        date,
        message,
        timestamp: new Date().toISOString(),
        points: pointsAwarded
      };
      
      // Add to logs and scores
      data.logs.push(logEntry);
      data.scores.push({
        id: randomUUID(),
        points: pointsAwarded,
        timestamp: new Date().toISOString()
      });
      
      // Save data
      saveData(data);
    }

    // Generate AI response
    try {
      if (process.env.OPENAI_API_KEY) {
        const systemPrompt = `You are StreakMind, a friendly, upbeat accountability buddy.
Style: extremely concise (1–2 sentences), positive, specific; mention points/streak only if updated.
Never give medical, legal, or financial advice.`;

        const userContext = logEntry 
          ? `User logged: ${logEntry.activity} (${logEntry.amount} ${logEntry.unit}). Points awarded: ${pointsAwarded}. ${streakUpdated ? `Streak updated to ${data.streaks[logEntry.activity]}.` : 'Streak unchanged.'}`
          : message;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 120,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext }
          ]
        });
        
        reply = completion.choices?.[0]?.message?.content?.trim() || "Logged! Keep it up.";
      } else {
        reply = "⚠️ I couldn't reach the brain right now, but your log is saved.";
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      reply = logEntry 
        ? `Great job! +${pointsAwarded} points. ${streakUpdated ? `${logEntry.activity} streak: ${data.streaks[logEntry.activity]} days!` : ''}`
        : "⚠️ I couldn't reach the brain right now, but your log is saved.";
    }

    res.json({
      reply,
      logEntry,
      pointsAwarded,
      streakUpdated,
      currentStreak: logEntry ? data.streaks[logEntry.activity] || 0 : null
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stats endpoint
router.get("/stats", (req, res) => {
  try {
    const data = loadData();
    
    // Calculate total points
    const totalPoints = data.scores.reduce((sum, score) => sum + score.points, 0);
    
    // Get badges
    const badges = calculateBadges(data.streaks);
    
    // Get recent logs (last 50)
    const logs = data.logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    res.json({
      totalPoints,
      streaks: data.streaks,
      badges,
      logs
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export const apiRouter = router;
      `Code master! ${value} solutions created. Every problem you solve makes you stronger! +${points} points.`
    ],
    gym: [
      `Fitness champion! Another powerful workout complete. Your body is getting stronger every day! +${points} points.`,
      `Warrior mode activated! That workout was incredible. You're transforming into your best self! +${points} points.`,
      `Beast mode! Workout crushed today. Your dedication to health is absolutely amazing! +${points} points.`,
      `Fitness hero! Another session done. Your commitment to wellness inspires me! +${points} points.`
    ],
    sleep: [
      `Sleep champion! ${value} hours of quality rest achieved. Recovery is just as important as action! +${points} points.`,
      `Rest and recharge complete! ${value} hours of healing sleep. Your body will thank you tomorrow! +${points} points.`,
      `Sleep master! ${value} hours logged. Good rest fuels great days ahead! +${points} points.`,
      `Recovery hero! ${value} hours of restoration. Sleep is where the magic happens! +${points} points.`
    ],
    reading: [
      `Knowledge seeker! Reading session complete. Your mind is expanding with every page! +${points} points.`,
      `Wisdom warrior! Another learning milestone achieved. Books are your gateway to growth! +${points} points.`,
      `Learning legend! Reading time invested wisely. Knowledge is the best investment! +${points} points.`,
      `Mind builder! Reading session done. You're feeding your brain the best fuel! +${points} points.`
    ]
  };
  
  const categoryResponses = responses[habitName as keyof typeof responses] || [
    `Habit champion! Goal achieved today. Your consistency is building something beautiful! +${points} points.`
  ];
  
  let message = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  
  // Add streak celebration if milestone reached
  if (streakBonus && isFirstToday) {
    message += ` ${streakBonus}`;
  } else if (isFirstToday && currentStreak > 1) {
    message += ` Day ${currentStreak} streak! ${motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]}`;
  } else if (!isFirstToday) {
    message += ` Extra logging today - love the enthusiasm!`;
  }
  
  return message;
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

    // Check if user already logged this habit today
    const today = new Date().toDateString();
    const todayEntries = Object.values(data.habitEntries)
      .filter((entry: any) => 
        entry.userId === DEFAULT_USER_ID && 
        entry.habitId === (habit as any).id && 
        new Date(entry.date).toDateString() === today
      );

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

    // Update user points and streak (only if first entry today)
    const user = data.users[DEFAULT_USER_ID];
    if (user) {
      user.totalPoints = (user.totalPoints || 0) + points;
      
      // Only increment streak if this is the first habit entry today
      if (todayEntries.length === 0) {
        // Check if user logged yesterday to maintain streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        const yesterdayEntries = Object.values(data.habitEntries)
          .filter((entry: any) => 
            entry.userId === DEFAULT_USER_ID && 
            new Date(entry.date).toDateString() === yesterdayString
          );
        
        if (yesterdayEntries.length > 0 || user.currentStreak === 0) {
          user.currentStreak = (user.currentStreak || 0) + 1;
        } else {
          user.currentStreak = 1; // Reset streak if gap found
        }
      }
    }

    // Generate AI response
    const isFirstToday = todayEntries.length === 0;
    const aiResponse = generateAIResponse(habitInfo.habitName, habitInfo.value, points, isFirstToday, user?.currentStreak || 0);
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