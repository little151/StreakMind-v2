import express from "express";
import cors from "cors";
import { createServer } from "http";
import { apiRouter } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || "5000");

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", apiRouter);

if (process.env.NODE_ENV === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
