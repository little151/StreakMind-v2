import { type User, type InsertUser, type Habit, type InsertHabit, type HabitEntry, type InsertHabitEntry, type Message, type InsertMessage, type Badge, type InsertBadge, type UserBadge, type InsertUserBadge } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;

  // Habit methods
  getHabits(userId: string): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, habit: Partial<Habit>): Promise<Habit>;

  // Habit entry methods
  getHabitEntries(userId: string, habitId?: string, limit?: number): Promise<HabitEntry[]>;
  createHabitEntry(entry: InsertHabitEntry): Promise<HabitEntry>;
  getHabitEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<HabitEntry[]>;

  // Message methods
  getMessages(userId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Badge methods
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  createBadge(badge: InsertBadge): Promise<Badge>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private habits: Map<string, Habit> = new Map();
  private habitEntries: Map<string, HabitEntry> = new Map();
  private messages: Map<string, Message> = new Map();
  private badges: Map<string, Badge> = new Map();
  private userBadges: Map<string, UserBadge> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Create default badges
    const defaultBadges: InsertBadge[] = [
      {
        name: "Fire Streak",
        description: "Maintain a 7 day streak",
        icon: "fas fa-fire",
        color: "yellow",
        requirement: "7_day_streak",
        category: "streak"
      },
      {
        name: "Code Master",
        description: "Solve 100 coding problems",
        icon: "fas fa-code",
        color: "purple",
        requirement: "100_coding_problems",
        category: "coding"
      },
      {
        name: "Gym Warrior",
        description: "Complete 30 gym sessions",
        icon: "fas fa-dumbbell",
        color: "green",
        requirement: "30_gym_sessions",
        category: "fitness"
      },
      {
        name: "Sleep Champion",
        description: "Average 8 hours of sleep",
        icon: "fas fa-moon",
        color: "blue",
        requirement: "8h_sleep_average",
        category: "sleep"
      }
    ];

    defaultBadges.forEach(badge => this.createBadge(badge));

    // Create a default user for demo
    const defaultUser = this.createUser({
      username: "demo",
      password: "demo",
      totalPoints: 1247,
      currentStreak: 12,
      badges: [],
      settings: { theme: "light", notifications: true }
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      totalPoints: insertUser.totalPoints ?? 0,
      currentStreak: insertUser.currentStreak ?? 0,
      badges: insertUser.badges ?? [],
      settings: insertUser.settings ?? {},
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateUser: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId);
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = {
      id,
      name: insertHabit.name,
      category: insertHabit.category,
      userId: insertHabit.userId,
      description: insertHabit.description ?? null,
      pointsPerCompletion: insertHabit.pointsPerCompletion ?? 10,
      visualizationType: insertHabit.visualizationType ?? "calendar",
      currentStreak: insertHabit.currentStreak ?? 0,
      isActive: insertHabit.isActive ?? true,
      createdAt: new Date()
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updateHabit: Partial<Habit>): Promise<Habit> {
    const habit = this.habits.get(id);
    if (!habit) throw new Error("Habit not found");
    
    const updatedHabit = { ...habit, ...updateHabit };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async getHabitEntries(userId: string, habitId?: string, limit?: number): Promise<HabitEntry[]> {
    let entries = Array.from(this.habitEntries.values())
      .filter(entry => entry.userId === userId);
    
    if (habitId) {
      entries = entries.filter(entry => entry.habitId === habitId);
    }
    
    entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (limit) {
      entries = entries.slice(0, limit);
    }
    
    return entries;
  }

  async createHabitEntry(insertEntry: InsertHabitEntry): Promise<HabitEntry> {
    const id = randomUUID();
    const entry: HabitEntry = {
      id,
      userId: insertEntry.userId,
      habitId: insertEntry.habitId,
      value: insertEntry.value ?? 1,
      points: insertEntry.points ?? 0,
      date: insertEntry.date ?? new Date(),
      metadata: insertEntry.metadata ?? {}
    };
    this.habitEntries.set(id, entry);
    return entry;
  }

  async getHabitEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<HabitEntry[]> {
    return Array.from(this.habitEntries.values())
      .filter(entry => 
        entry.userId === userId &&
        entry.date >= startDate &&
        entry.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getMessages(userId: string, limit: number = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      userId: insertMessage.userId,
      content: insertMessage.content,
      isFromUser: insertMessage.isFromUser,
      habitEntryId: insertMessage.habitEntryId ?? null,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(ub => ub.userId === userId);
  }

  async awardBadge(insertUserBadge: InsertUserBadge): Promise<UserBadge> {
    const id = randomUUID();
    const userBadge: UserBadge = {
      ...insertUserBadge,
      id,
      earnedAt: new Date()
    };
    this.userBadges.set(id, userBadge);
    return userBadge;
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = randomUUID();
    const badge: Badge = {
      ...insertBadge,
      id
    };
    this.badges.set(id, badge);
    return badge;
  }
}

export const storage = new MemStorage();
