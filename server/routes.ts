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