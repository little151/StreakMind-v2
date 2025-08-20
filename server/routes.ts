import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertHabitEntrySchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Simple NLP for habit recognition
function parseHabitMessage(message: string): { habit: string; value: number; category: string } | null {
  const lower = message.toLowerCase();
  
  // Coding patterns
  if (lower.includes('coding') || lower.includes('code') || lower.includes('question') || lower.includes('problem')) {
    const match = lower.match(/(\d+)\s*(?:coding\s*)?(?:question|problem)/);
    const value = match ? parseInt(match[1]) : 1;
    return { habit: 'coding', value, category: 'coding' };
  }
  
  // Gym patterns
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise')) {
    const match = lower.match(/(\d+)\s*(?:hour|hr|min)/);
    const value = match ? parseInt(match[1]) : 1;
    return { habit: 'gym', value, category: 'fitness' };
  }
  
  // Sleep patterns
  if (lower.includes('sleep') || lower.includes('slept')) {
    const match = lower.match(/(\d+)\s*(?:hour|hr)/);
    const value = match ? parseInt(match[1]) : 8;
    return { habit: 'sleep', value, category: 'sleep' };
  }
  
  // Reading patterns
  if (lower.includes('read') || lower.includes('book')) {
    const match = lower.match(/(\d+)\s*(?:page|chapter|book)/);
    const value = match ? parseInt(match[1]) : 1;
    return { habit: 'reading', value, category: 'learning' };
  }
  
  return null;
}

function generateAIResponse(habitName: string, value: number, streak: number, points: number): string {
  const responses = {
    coding: [
      `Awesome! 🎉 Your coding streak is now ${streak} days! +${points} points earned.`,
      `Great work on those ${value} coding problems! 💻 Streak: ${streak} days. +${points} points!`,
      `Coding master in action! ${value} problems solved. ${streak} day streak! +${points} points.`
    ],
    gym: [
      `Great job! 💪 Gym streak: ${streak} days. You're crushing it! +${points} points.`,
      `Workout complete! 🏋️ ${streak} days strong. +${points} points earned.`,
      `Fitness warrior! ${streak} day gym streak. Keep it up! +${points} points.`
    ],
    sleep: [
      `Good sleep! 😴 ${value} hours logged. ${streak} day streak! +${points} points.`,
      `Rest well earned! 🌙 Sleep streak: ${streak} days. +${points} points.`,
      `Sleep champion! ${value} hours tracked. ${streak} days consistent! +${points} points.`
    ],
    reading: [
      `Knowledge gained! 📚 Reading streak: ${streak} days. +${points} points.`,
      `Great reading! 📖 ${value} progress logged. ${streak} day streak! +${points} points.`,
      `Bookworm mode! 📚 ${streak} days of consistent reading. +${points} points.`
    ]
  };
  
  const habitResponses = responses[habitName as keyof typeof responses] || [
    `Excellent! ${habitName} completed. ${streak} day streak! +${points} points.`
  ];
  
  return habitResponses[Math.floor(Math.random() * habitResponses.length)];
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (demo user for now)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user habits
  app.get("/api/habits", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const habits = await storage.getHabits(user.id);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habits" });
    }
  });

  // Get habit entries
  app.get("/api/habit-entries", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { habitId, limit, startDate, endDate } = req.query;
      
      let entries;
      if (startDate && endDate) {
        entries = await storage.getHabitEntriesByDateRange(
          user.id,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        entries = await storage.getHabitEntries(
          user.id,
          habitId as string,
          limit ? parseInt(limit as string) : undefined
        );
      }
      
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habit entries" });
    }
  });

  // Get messages
  app.get("/api/messages", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const messages = await storage.getMessages(user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Send message and process habit
  app.post("/api/messages", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { content } = insertMessageSchema.parse(req.body);
      
      // Create user message
      const userMessage = await storage.createMessage({
        userId: user.id,
        content,
        isFromUser: true,
        habitEntryId: null
      });

      // Parse habit from message
      const habitInfo = parseHabitMessage(content);
      let aiResponse = "I understand! Keep up the great work! 🎉";
      let habitEntry = null;

      if (habitInfo) {
        // Find or create habit
        const habits = await storage.getHabits(user.id);
        let habit = habits.find(h => h.name.toLowerCase() === habitInfo.habit);
        
        if (!habit) {
          habit = await storage.createHabit({
            userId: user.id,
            name: habitInfo.habit,
            category: habitInfo.category,
            description: `Track ${habitInfo.habit} progress`,
            pointsPerCompletion: habitInfo.category === 'coding' ? 20 : 15,
            visualizationType: habitInfo.category === 'coding' ? 'calendar' : 
                             habitInfo.category === 'fitness' ? 'circle' : 'bar',
            currentStreak: 0,
            isActive: true
          });
        }

        // Create habit entry
        const points = habit.pointsPerCompletion * habitInfo.value;
        habitEntry = await storage.createHabitEntry({
          userId: user.id,
          habitId: habit.id,
          value: habitInfo.value,
          points,
          date: new Date(),
          metadata: { originalMessage: content }
        });

        // Update habit streak
        const newStreak = habit.currentStreak + 1;
        await storage.updateHabit(habit.id, { currentStreak: newStreak });

        // Update user points and streak
        await storage.updateUser(user.id, {
          totalPoints: user.totalPoints + points,
          currentStreak: Math.max(user.currentStreak, newStreak)
        });

        aiResponse = generateAIResponse(habitInfo.habit, habitInfo.value, newStreak, points);
      }

      // Create AI response message
      const aiMessage = await storage.createMessage({
        userId: user.id,
        content: aiResponse,
        isFromUser: false,
        habitEntryId: habitEntry?.id || null
      });

      res.json({ userMessage, aiMessage, habitEntry });
    } catch (error) {
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Get user badges
  app.get("/api/user-badges", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userBadges = await storage.getUserBadges(user.id);
      const allBadges = await storage.getAllBadges();
      
      const badgesWithDetails = userBadges.map(ub => {
        const badge = allBadges.find(b => b.id === ub.badgeId);
        return { ...ub, badge };
      });
      
      res.json(badgesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user badges" });
    }
  });

  // Update user settings
  app.patch("/api/user/settings", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { settings } = req.body;
      const currentSettings = typeof user.settings === 'object' && user.settings !== null ? user.settings as Record<string, any> : {};
      const updatedUser = await storage.updateUser(user.id, {
        settings: { ...currentSettings, ...settings }
      });
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
