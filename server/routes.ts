// server/routes.ts
import { Router } from "express";
import { randomUUID } from "crypto";
import {
  loadData,
  saveData,
  parseLogIntent,
  calculatePoints,
  shouldIncrementStreak,
  calculateBadges,
  createActivity,
  updateActivity,
  deleteActivity,
  parseCRUDCommand,
  loadChatData,
  saveChatData,
  addChatMessage,
  deleteChatMessage,
  clearAllChatMessages,
  loadMemory,
  saveMemory,
  updateMemoryFromMessage,
  getMemoryContext,
  loadSettings,
  saveSettings,
  updateSettings,
  type LogEntry,
  type Activity,
  type AppData,
  type ChatMessage,
  type UserMemory,
  type AppSettings,
} from "./data-helpers";

// Enhanced personality system functions
function detectPersonalityNeeded(message: string): 'therapist' | 'friend' | 'trainer' | 'default' {
  const text = message.toLowerCase();
  
  // Therapist mode: emotional support, struggles, feelings
  if (text.includes('feel') || text.includes('struggle') || text.includes('depressed') || 
      text.includes('anxious') || text.includes('stressed') || text.includes('motivation') ||
      text.includes('hard time') || text.includes('difficult') || text.includes('help me')) {
    return 'therapist';
  }
  
  // Trainer mode: fitness, pushing limits, performance, accountability
  if (text.includes('gym') || text.includes('workout') || text.includes('exercise') ||
      text.includes('push') || text.includes('harder') || text.includes('challenge') ||
      text.includes('pr') || text.includes('personal record') || text.includes('lift') ||
      text.includes('lazy') || text.includes('procrastinating') || text.includes('excuse') ||
      text.includes('skip') || text.includes('missed') || text.includes('didn\'t do') ||
      text.includes('failed') || text.includes('disappointed')) {
    return 'trainer';
  }
  
  // Friend mode: casual conversation, sharing, celebration
  if (text.includes('awesome') || text.includes('great') || text.includes('amazing') ||
      text.includes('love') || text.includes('friend') || text.includes('chat') ||
      text.includes('how are') || text.includes('what\'s up')) {
    return 'friend';
  }
  
  return 'default';
}

function buildEnhancedPrompt(
  mode: string, 
  data: AppData, 
  settings: AppSettings,
  logEntry: any, 
  pointsAwarded: number, 
  streakUpdated: boolean,
  isGeneralQuery: boolean = false
): string {
  // Get memory context for personalized responses
  const memoryContext = getMemoryContext();
  
  // For general queries unrelated to habit tracking, behave as a normal AI assistant
  if (isGeneralQuery) {
    const personalContext = memoryContext ? ` Remember: ${memoryContext}` : '';
    return `You are a helpful AI assistant powered by Gemini. Answer the user's question naturally and helpfully. You can discuss any topic, provide information, help with tasks, or have casual conversation. Be knowledgeable, friendly, and engaging.${personalContext}`;
  }

  const baseContext = `Current user stats: ${Object.keys(data.streaks).length} active habits, highest streak: ${Math.max(...Object.values(data.streaks) as number[], 0)} days. ${memoryContext ? `Personal context: ${memoryContext}` : ''}`;
  
  // Filter enabled personalities
  const enabledPersonalities = Object.entries(settings.enabledPersonalities)
    .filter(([_, enabled]) => enabled)
    .map(([personality, _]) => personality);
  
  // If the detected mode is disabled, fall back to default
  if (!enabledPersonalities.includes(mode)) {
    mode = 'default';
  }
  
  const modePrompts = {
    therapist: `You are StreakMind in therapist mode: warm, empathetic, understanding, and supportive. Provide emotional support and gentle encouragement. Ask thoughtful questions about their feelings and offer comfort. Keep responses caring but concise (2-3 sentences max). ${baseContext}`,
    
    trainer: `You are StreakMind in trainer mode: energetic, motivational, focused on pushing limits and celebrating victories. Use fitness terminology and pump them up. When users show accountability issues, provide firm but caring motivation. Focus on progress, gains, and next challenges. Keep responses high-energy but concise (2-3 sentences max). ${baseContext}`,
    
    friend: `You are StreakMind in friend mode: casual, supportive, fun, and relatable. Chat like a good friend who genuinely cares about their progress. Be encouraging and positive. Keep responses friendly and conversational (2-3 sentences max). ${baseContext}`,
    
    default: `You are StreakMind, an adaptive AI companion that helps users track habits and stay motivated. Be positive, supportive, and encouraging. Adapt your tone to match the user's energy. Keep responses helpful and concise (2-3 sentences max). ${baseContext}`
  };
  
  return modePrompts[mode as keyof typeof modePrompts] || modePrompts.default;
}

function handleDynamicActivityCreation(message: string, data: AppData): string | null {
  const text = message.toLowerCase();
  
  // Pattern: "I want to track [activity]" or "Add [activity] to my habits" or "Start tracking [activity]"
  const trackingPatterns = [
    /(?:i want to track|want to track|add|start tracking|begin tracking)\s+(.+?)(?:\s|$)/,
    /track\s+(.+?)(?:\s+for me|\s+daily|\s+habit|$)/,
    /add\s+(.+?)(?:\s+to my habits|\s+habit|\s+tracking|$)/
  ];
  
  for (const pattern of trackingPatterns) {
    const match = text.match(pattern);
    if (match) {
      const activityName = match[1].trim()
        .replace(/\b(habit|daily|tracking|for me)\b/g, '')
        .trim();
      
      if (activityName && activityName.length > 0 && activityName.length < 50) {
        // Use the new createActivity function
        if (!data.activities[activityName] && !data.streaks[activityName]) {
          createActivity(data, activityName);
          return activityName;
        }
      }
    }
  }
  
  return null;
}

// Check if message is a general query (not habit-related)
function isGeneralQuery(message: string): boolean {
  const habitKeywords = ['track', 'log', 'streak', 'habit', 'points', 'score', 'gym', 'coding', 'sleep', 'meditation', 'reading', 'exercise', 'workout', 'did', 'completed', 'finished', 'yesterday', 'today'];
  const text = message.toLowerCase();
  
  // If message contains habit-related keywords, it's not a general query
  for (const keyword of habitKeywords) {
    if (text.includes(keyword)) {
      return false;
    }
  }
  
  // Check for CRUD commands
  const crudCommand = parseCRUDCommand(message);
  if (crudCommand.action) {
    return false;
  }
  
  // Check for activity creation patterns
  if (handleDynamicActivityCreation(message, { activities: {}, streaks: {} } as AppData)) {
    return false;
  }
  
  return true;
}

/**
 * createApiRouter(genai)
 * - genai: instance of GoogleGenerativeAI
 */
export function createApiRouter(genai: any) {
  const router = Router();

  // -------------------- Messages Endpoints --------------------
  
  // Get all messages
  router.get("/messages", (req, res) => {
    try {
      const messages = loadChatData();
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Send a new message
  router.post("/messages", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Message content is required" });
      }

      const data = loadData();
      
      // Add user message
      const userMessage: ChatMessage = {
        id: randomUUID(),
        role: 'user',
        message: content,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(userMessage);
      
      // Update memory with user message
      updateMemoryFromMessage(content, true);

      // Check for dynamic activity creation first
      const newActivity = handleDynamicActivityCreation(content, data);
      if (newActivity) {
        saveData(data);
        // Generate response for new activity creation
        const personalityMode = detectPersonalityNeeded(content);
        const settings = loadSettings();
        const systemPrompt = buildEnhancedPrompt(personalityMode, data, settings, null, 0, false, false);
        
        let activityReply = "";
        try {
          const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
          const model = genai.getGenerativeModel({ model: modelName });
          const prompt = `${systemPrompt}\n\nUser wants to start tracking a new habit: "${newActivity}". Congratulate them on adding this new habit and encourage them to start their first log.`;
          const response = await model.generateContent(prompt);
          activityReply = response?.response?.text()?.trim() || `Great! I've added "${newActivity}" to your habit tracking. Start logging it today!`;
        } catch (err) {
          console.error("Gemini API error:", err);
          activityReply = `Perfect! I've added "${newActivity}" to your habits. You can now track it by mentioning it in our chat!`;
        }
        
        // Add bot response
        const botMessage: ChatMessage = {
          id: randomUUID(),
          role: 'assistant',
          message: activityReply,
          timestamp: new Date().toISOString(),
        };
        addChatMessage(botMessage);
        
        // Update memory with bot response context
        updateMemoryFromMessage(activityReply, false);
        saveData(data);
        
        return res.json({ reply: activityReply, newActivity, activityCreated: true });
      }

      const existingActivities = Object.keys(data.streaks);
      const logIntent = parseLogIntent(content, existingActivities);

      let reply = "";
      let logEntry: LogEntry | null = null;
      let pointsAwarded = 0;
      let streakUpdated = false;

      // Logging flow
      if (logIntent) {
        const { activity, amount, unit, date } = logIntent;

        pointsAwarded = calculatePoints(activity, amount, unit, data);

        if (shouldIncrementStreak(data, activity, date)) {
          data.streaks[activity] = (data.streaks[activity] || 0) + 1;
          streakUpdated = true;
        }

        logEntry = {
          id: randomUUID(),
          activity,
          amount,
          unit,
          date,
          message: content,
          timestamp: new Date().toISOString(),
          points: pointsAwarded,
        };

        data.logs.push(logEntry);
        data.scores.push({
          id: randomUUID(),
          points: pointsAwarded,
          timestamp: new Date().toISOString(),
        });
      }

      // Check if this is a general query or habit-related
      const isGeneral = isGeneralQuery(content);
      const personalityMode = isGeneral ? 'default' : detectPersonalityNeeded(content);
      const settings = loadSettings();
      const systemPrompt = buildEnhancedPrompt(personalityMode, data, settings, logEntry, pointsAwarded, streakUpdated, isGeneral);
      
      // Handle CRUD commands
      const crudCommand = parseCRUDCommand(content);
      if (crudCommand.action && !isGeneral) {
        let crudResult = '';
        
        switch (crudCommand.action) {
          case 'delete':
            if (crudCommand.activity && deleteActivity(data, crudCommand.activity)) {
              crudResult = `Deleted "${crudCommand.activity}" from your habits.`;
            } else {
              crudResult = `Couldn't find "${crudCommand.activity}" to delete.`;
            }
            break;
            
          case 'update':
            if (crudCommand.activity && crudCommand.newName && updateActivity(data, crudCommand.activity, { name: crudCommand.newName })) {
              crudResult = `Renamed "${crudCommand.activity}" to "${crudCommand.newName}".`;
            } else {
              crudResult = `Couldn't rename "${crudCommand.activity}".`;
            }
            break;
            
          case 'setpoints':
            if (crudCommand.activity && crudCommand.points !== undefined && updateActivity(data, crudCommand.activity, { customPoints: crudCommand.points })) {
              crudResult = `Set "${crudCommand.activity}" to ${crudCommand.points} points per session.`;
            } else {
              crudResult = `Couldn't set points for "${crudCommand.activity}".`;
            }
            break;
        }
        
        if (crudResult) {
          const botMessage: ChatMessage = {
            id: randomUUID(),
            role: 'assistant',
            message: crudResult,
            timestamp: new Date().toISOString(),
          };
          addChatMessage(botMessage);
          saveData(data);
          return res.json({ reply: crudResult, crudAction: crudCommand.action });
        }
      }

      const userContext = logEntry
        ? `User logged: ${logEntry.activity} (${logEntry.amount} ${logEntry.unit}). Points awarded: ${pointsAwarded}. ${streakUpdated ? `Streak updated to ${data.streaks[logEntry.activity]}.` : "Streak unchanged."}`
        : content;

      // Use Gemini API
      try {
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const model = genai.getGenerativeModel({ model: modelName });

        const prompt = `${systemPrompt}\n\n${userContext}`;

        const response = await model.generateContent(prompt);

        reply = response?.response?.text()?.trim() || "Logged! Keep it up.";
      } catch (err) {
        console.error("Gemini API error:", err);
        reply = logEntry
          ? `Great job! +${pointsAwarded} points. ${streakUpdated ? `${logEntry.activity} streak: ${data.streaks[logEntry.activity]} days!` : ""}`
          : "⚠️ I couldn't reach the brain right now, but your log is saved.";
      }

      // Add bot response
      const botMessage: ChatMessage = {
        id: randomUUID(),
        role: 'assistant',
        message: reply,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(botMessage);
      
      // Update memory with bot response context
      updateMemoryFromMessage(reply, false);
      saveData(data);

      res.json({
        reply,
        logEntry,
        pointsAwarded,
        streakUpdated,
        currentStreak: logEntry ? data.streaks[logEntry.activity] || 0 : null,
      });
    } catch (error) {
      console.error("Messages endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete all messages
  router.delete("/messages", (req, res) => {
    try {
      clearAllChatMessages();
      res.json({ message: "All messages deleted successfully" });
    } catch (error) {
      console.error("Delete all messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete a specific message
  router.delete("/messages/:id", (req, res) => {
    try {
      const { id } = req.params;
      const messages = loadChatData();
      const messageExists = messages.some(msg => msg.id === id);
      
      if (!messageExists) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      deleteChatMessage(id);
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete message error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Chat Endpoint (Legacy) --------------------
  router.post("/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const data = loadData();
      
      // Check for dynamic activity creation first
      const newActivity = handleDynamicActivityCreation(message, data);
      if (newActivity) {
        saveData(data);
        // Generate response for new activity creation
        const personalityMode = detectPersonalityNeeded(message);
        const settings = loadSettings();
        const systemPrompt = buildEnhancedPrompt(personalityMode, data, settings, null, 0, false, false);
        
        let activityReply = "";
        try {
          const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
          const model = genai.getGenerativeModel({ model: modelName });
          const prompt = `${systemPrompt}\n\nUser wants to start tracking a new habit: "${newActivity}". Congratulate them on adding this new habit and encourage them to start their first log.`;
          const response = await model.generateContent(prompt);
          activityReply = response?.response?.text()?.trim() || `Great! I've added "${newActivity}" to your habit tracking. Start logging it today!`;
        } catch (err) {
          console.error("Gemini API error:", err);
          activityReply = `Perfect! I've added "${newActivity}" to your habits. You can now track it by mentioning it in our chat!`;
        }
        
        return res.json({ reply: activityReply, newActivity, activityCreated: true });
      }

      const existingActivities = Object.keys(data.streaks);
      const logIntent = parseLogIntent(message, existingActivities);

      let reply = "";
      let logEntry: LogEntry | null = null;
      let pointsAwarded = 0;
      let streakUpdated = false;

      // ✅ Logging flow
      if (logIntent) {
        const { activity, amount, unit, date } = logIntent;

        pointsAwarded = calculatePoints(activity, amount, unit, data);

        if (shouldIncrementStreak(data, activity, date)) {
          data.streaks[activity] = (data.streaks[activity] || 0) + 1;
          streakUpdated = true;
        }

        logEntry = {
          id: randomUUID(),
          activity,
          amount,
          unit,
          date,
          message,
          timestamp: new Date().toISOString(),
          points: pointsAwarded,
        };

        data.logs.push(logEntry);
        data.scores.push({
          id: randomUUID(),
          points: pointsAwarded,
          timestamp: new Date().toISOString(),
        });

        saveData(data);
      }

      // Check if this is a general query or habit-related
      const isGeneral = isGeneralQuery(message);
      const personalityMode = isGeneral ? 'default' : detectPersonalityNeeded(message);
      const settings = loadSettings();
      const systemPrompt = buildEnhancedPrompt(personalityMode, data, settings, logEntry, pointsAwarded, streakUpdated, isGeneral);
      
      // Handle CRUD commands
      const crudCommand = parseCRUDCommand(message);
      if (crudCommand.action && !isGeneral) {
        let crudResult = '';
        
        switch (crudCommand.action) {
          case 'delete':
            if (crudCommand.activity && deleteActivity(data, crudCommand.activity)) {
              crudResult = `Deleted "${crudCommand.activity}" from your habits.`;
              saveData(data);
            } else {
              crudResult = `Couldn't find "${crudCommand.activity}" to delete.`;
            }
            break;
            
          case 'update':
            if (crudCommand.activity && crudCommand.newName && updateActivity(data, crudCommand.activity, { name: crudCommand.newName })) {
              crudResult = `Renamed "${crudCommand.activity}" to "${crudCommand.newName}".`;
              saveData(data);
            } else {
              crudResult = `Couldn't rename "${crudCommand.activity}".`;
            }
            break;
            
          case 'setpoints':
            if (crudCommand.activity && crudCommand.points !== undefined && updateActivity(data, crudCommand.activity, { customPoints: crudCommand.points })) {
              crudResult = `Set "${crudCommand.activity}" to ${crudCommand.points} points per session.`;
              saveData(data);
            } else {
              crudResult = `Couldn't set points for "${crudCommand.activity}".`;
            }
            break;
        }
        
        if (crudResult) {
          return res.json({ reply: crudResult, crudAction: crudCommand.action });
        }
      }

      const userContext = logEntry
        ? `User logged: ${logEntry.activity} (${logEntry.amount} ${logEntry.unit}). Points awarded: ${pointsAwarded}. ${streakUpdated ? `Streak updated to ${data.streaks[logEntry.activity]}.` : "Streak unchanged."}`
        : message;

      // ✅ Use Gemini API
      try {
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const model = genai.getGenerativeModel({ model: modelName });

        const prompt = `${systemPrompt}\n\n${userContext}`;

        const response = await model.generateContent(prompt);

        reply = response?.response?.text()?.trim() || "Logged! Keep it up.";
      } catch (err) {
        console.error("Gemini API error:", err);
        reply = logEntry
          ? `Great job! +${pointsAwarded} points. ${streakUpdated ? `${logEntry.activity} streak: ${data.streaks[logEntry.activity]} days!` : ""}`
          : "⚠️ I couldn't reach the brain right now, but your log is saved.";
      }

      res.json({
        reply,
        logEntry,
        pointsAwarded,
        streakUpdated,
        currentStreak: logEntry ? data.streaks[logEntry.activity] || 0 : null,
      });
    } catch (error) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Stats Endpoint --------------------
  router.get("/stats", (req, res) => {
    try {
      const data = loadData();

      const totalPoints = data.scores.reduce((sum, score) => sum + score.points, 0);
      const badges = calculateBadges(data.streaks);

      const logs = data.logs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50);

      res.json({
        totalPoints,
        streaks: data.streaks,
        badges,
        logs,
        activities: data.activities,
      });
    } catch (error) {
      console.error("Stats endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Memory Endpoint --------------------
  router.get("/memory", (req, res) => {
    try {
      const memory = loadMemory();
      res.json(memory);
    } catch (error) {
      console.error("Memory endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Activities CRUD Endpoints --------------------
  router.post("/activities", (req, res) => {
    try {
      const { name, customPoints, visualizationType } = req.body;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Activity name is required" });
      }

      const data = loadData();
      
      if (data.activities[name]) {
        return res.status(400).json({ error: "Activity already exists" });
      }

      const activity = createActivity(data, name, customPoints);
      if (visualizationType) {
        activity.visualizationType = visualizationType;
      }
      
      saveData(data);
      res.json({ activity, message: `Created activity "${name}"` });
    } catch (error) {
      console.error("Create activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.put("/activities/:name", (req, res) => {
    try {
      const { name } = req.params;
      const updates = req.body;
      
      const data = loadData();
      
      if (updateActivity(data, name, updates)) {
        saveData(data);
        res.json({ message: "Activity updated successfully" });
      } else {
        res.status(404).json({ error: "Activity not found" });
      }
    } catch (error) {
      console.error("Update activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.delete("/activities/:name", (req, res) => {
    try {
      const { name } = req.params;
      
      const data = loadData();
      
      if (deleteActivity(data, name)) {
        saveData(data);
        res.json({ message: `Deleted activity "${name}"` });
      } else {
        res.status(404).json({ error: "Activity not found" });
      }
    } catch (error) {
      console.error("Delete activity error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Settings Endpoints --------------------
  
  // Get all settings
  router.get("/settings", (req, res) => {
    try {
      const settings = loadSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update settings (partial update)
  router.put("/settings", (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = updateSettings(updates);
      res.json({ 
        message: "Settings updated successfully", 
        settings: updatedSettings 
      });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reset settings to defaults
  router.post("/settings/reset", (req, res) => {
    try {
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
      res.json({ 
        message: "Settings reset to defaults", 
        settings: defaultSettings 
      });
    } catch (error) {
      console.error("Reset settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Health Endpoint --------------------
  router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return router;
}
