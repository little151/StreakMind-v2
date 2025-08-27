import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("❌ GEMINI_API_KEY missing in .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Pick a lightweight model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Say hi in one short sentence";

  const result = await model.generateContent(prompt);

  console.log("Gemini reply:", result.response.text());
}

main().catch(err => console.error("Test error:", err));
