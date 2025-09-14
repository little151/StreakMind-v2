import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { OfflineProvider } from "./contexts/offline-context";
import App from "./App";
import "./index.css";

console.log('Main.tsx loading...');
const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <QueryClientProvider client={queryClient}>
      <OfflineProvider>
        <App />
      </OfflineProvider>
    </QueryClientProvider>
  );
} else {
  console.error('Root element not found!');
}
