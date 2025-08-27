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

/**
 * createApiRouter(aiClient, aiType)
 * - aiClient: instance of GoogleGenerativeAI or OpenAI
 * - aiType: 'gemini' | 'openai' | null
 */
export function createApiRouter(aiClient: any, aiType: string | null) {
  const router = Router();

  // -------------------- Chat Endpoint --------------------
  router.post("/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const data = loadData();
      const logIntent = parseLogIntent(message);

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

      // ✅ Build system + user context
      const systemPrompt = `You are StreakMind, a friendly, upbeat accountability buddy.
Style: extremely concise (1–2 sentences), positive, specific; mention points/streak only if updated.
Never give medical, legal, or financial advice.`;

      const userContext = logEntry
        ? `User logged: ${logEntry.activity} (${logEntry.amount} ${logEntry.unit}). Points awarded: ${pointsAwarded}. ${streakUpdated ? `Streak updated to ${data.streaks[logEntry.activity]}.` : "Streak unchanged."}`
        : message;

      // ✅ Use AI API (Gemini or OpenAI)
      try {
        if (aiClient && aiType === "gemini") {
          const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
          const model = aiClient.getGenerativeModel({ model: modelName });

          const prompt = `${systemPrompt}\n\n${userContext}`;

          const response = await model.generateContent(prompt);

          reply = response?.response?.text()?.trim() || "Logged! Keep it up.";
        } else if (aiClient && aiType === "openai") {
          const completion = await aiClient.chat.completions.create({
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
      } catch (err) {
        console.error("AI API error:", err);
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
