// server/index.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ Gemini SDK
import OpenAI from "openai"; // ✅ OpenAI SDK
import { createApiRouter } from "./routes";
import { setupVite, serveStatic } from "./vite";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize AI client based on available API keys
let aiClient = null;
let aiType = null;
if (GEMINI_API_KEY) {
  console.log("🔧 Using Gemini AI");
  aiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  aiType = "gemini";
} else if (OPENAI_API_KEY) {
  console.log("🔧 Using OpenAI");
  aiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
  aiType = "openai";
} else {
  console.log("⚠️ No AI API key found. App will work with basic parsing only.");
}

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// ✅ Mount API routes with AI client
app.use("/api", createApiRouter(aiClient, aiType));

// ✅ Vite / static serving
if (process.env.NODE_ENV === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
