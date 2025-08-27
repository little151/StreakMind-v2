// server/index.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createApiRouter } from "./routes";
import { setupVite, serveStatic } from "./vite";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment. Please add it to Replit Secrets.");
  process.exit(1);
}

// Initialize Gemini client
const genai = new GoogleGenerativeAI(GEMINI_API_KEY);
console.log("🔧 Using Gemini AI");

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// ✅ Mount API routes with Gemini client
app.use("/api", createApiRouter(genai));

// ✅ Vite / static serving
if (process.env.NODE_ENV === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
