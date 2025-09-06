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
  type LogEntry,
} from "./data-helpers";

// Enhanced personality system functions
function detectPersonalityNeeded(message: string): 'therapist' | 'friend' | 'trainer' | 'father' | 'default' {
  const text = message.toLowerCase();
  
  // Therapist mode: emotional support, struggles, feelings
  if (text.includes('feel') || text.includes('struggle') || text.includes('depressed') || 
      text.includes('anxious') || text.includes('stressed') || text.includes('motivation') ||
      text.includes('hard time') || text.includes('difficult') || text.includes('help me')) {
    return 'therapist';
  }
  
  // Father mode: discipline, tough love, accountability
  if (text.includes('lazy') || text.includes('procrastinating') || text.includes('excuse') ||
      text.includes('skip') || text.includes('missed') || text.includes('didn\'t do') ||
      text.includes('failed') || text.includes('disappointed')) {
    return 'father';
  }
  
  // Trainer mode: fitness, pushing limits, performance
  if (text.includes('gym') || text.includes('workout') || text.includes('exercise') ||
      text.includes('push') || text.includes('harder') || text.includes('challenge') ||
      text.includes('pr') || text.includes('personal record') || text.includes('lift')) {
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
  data: any, 
  logEntry: any, 
  pointsAwarded: number, 
  streakUpdated: boolean
): string {
  const baseContext = `Current user stats: ${Object.keys(data.streaks).length} active habits, highest streak: ${Math.max(...Object.values(data.streaks) as number[], 0)} days.`;
  
  const modePrompts = {
    therapist: `You are StreakMind in therapist mode: warm, empathetic, understanding, and supportive. Provide emotional support and gentle encouragement. Ask thoughtful questions about their feelings and offer comfort. Keep responses caring but concise (2-3 sentences max). ${baseContext}`,
    
    father: `You are StreakMind in father mode: firm but loving, providing tough love and accountability. Call out excuses, push for discipline, but always show you care about their growth. Use direct language and high expectations. Keep responses firm but brief (2-3 sentences max). ${baseContext}`,
    
    trainer: `You are StreakMind in trainer mode: energetic, motivational, focused on pushing limits and celebrating victories. Use fitness terminology and pump them up. Focus on progress, gains, and next challenges. Keep responses high-energy but concise (2-3 sentences max). ${baseContext}`,
    
    friend: `You are StreakMind in friend mode: casual, supportive, fun, and relatable. Chat like a good friend who genuinely cares about their progress. Be encouraging and positive. Keep responses friendly and conversational (2-3 sentences max). ${baseContext}`,
    
    default: `You are StreakMind, an adaptive AI companion that helps users track habits and stay motivated. Be positive, supportive, and encouraging. Adapt your tone to match the user's energy. Keep responses helpful and concise (2-3 sentences max). ${baseContext}`
  };
  
  return modePrompts[mode as keyof typeof modePrompts] || modePrompts.default;
}

function handleDynamicActivityCreation(message: string, data: any): string | null {
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
        // Initialize the new activity in streaks
        if (!data.streaks[activityName]) {
          data.streaks[activityName] = 0;
          return activityName;
        }
      }
    }
  }
  
  return null;
}

/**
 * createApiRouter(genai)
 * - genai: instance of GoogleGenerativeAI
 */
export function createApiRouter(genai: any) {
  const router = Router();

  // -------------------- Chat Endpoint --------------------
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
        const systemPrompt = buildEnhancedPrompt(personalityMode, data, null, 0, false);
        
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

        pointsAwarded = calculatePoints(activity, amount, unit);

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

      // ✅ Build enhanced personality system
      const personalityMode = detectPersonalityNeeded(message);
      const systemPrompt = buildEnhancedPrompt(personalityMode, data, logEntry, pointsAwarded, streakUpdated);

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
      });
    } catch (error) {
      console.error("Stats endpoint error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // -------------------- Health Endpoint --------------------
  router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return router;
}
