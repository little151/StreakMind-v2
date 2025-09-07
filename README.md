# 📌 StreakMind  

**StreakMind** is an AI-powered **habit tracker + personal companion** that blends conversational AI with a flexible activity dashboard.  
It’s designed to act as a **therapist, friend, and trainer** — while giving you full manual control over how you track and score your activities.  

---

## 🚀 Vision  
StreakMind isn’t just another habit tracker.  
It’s a **chat-first AI assistant** that helps you:  
- Build and maintain daily streaks  
- Log activities seamlessly through conversation  
- Get guidance, motivation, and accountability  
- Customize your own tracking system with full flexibility  

Think of it as a **coach and companion in one app**.  

---

## ✨ Features  

### 🔹 Conversational AI (Google Gemini API)  
- Chat like you would with a friend or therapist.  
- If you ask a **generic question**, it answers like a normal AI assistant.  
- If you talk about **habits or streaks**, it automatically updates your logs.  
- Chat history now **persists across refresh** (saved in local storage / JSON file during testing).  
- Option to **delete individual chats** or clear all chats.  

### 🔹 Activity Management  
- **Add activities via chat** (e.g., *“I want to track reading books”*).  
- **Manual dashboard controls** → Add, edit, or delete activities with buttons.  
- Full **CRUD support** (Create, Read, Update, Delete) via both chat & UI.  
- Choose **custom points** per activity or use defaults.  

### 🔹 Personality Modes  
- Default roles: **Therapist, Friend, Trainer**.  
- Toggle personalities ON/OFF in settings.  

### 🔹 Scoring & Streaks  
- Default points per activity (e.g., +10 per log).  
- Option for **custom user-defined points** per activity.  
- Scoreboard visibility toggle:  
  - ON → shows activity dashboard with streaks, points, progress.  
  - OFF → hides it completely.  

### 🔹 Dashboard UI  
- **Dynamic layout** with animations and transitions.  
- Each activity displayed with progress visualization (heatmap, bar, pie, progress bar).  
- Choice of visualization style is **saved per activity**.  
- Smooth animations for adding, editing, and deleting activities.  
- Dark theme default, light theme optional.  

### 🔹 Info (“i”) Button  
Explains how to:  
- Log activities via chat  
- Manually add/delete/edit activities  
- Use CRUD commands  
- Toggle personalities  
- Customize points  
- Hide/show the score dashboard  
- Use AI for generic Q&A  
- Manage chat history (persistent + deletable)  

---

## 🛠️ Tech Stack  

- **Frontend**: React + TypeScript + TailwindCSS  
- **Backend**: Node.js + Express  
- **AI Engine**: Google Gemini API  
- **State/Data**: Local + JSON file (for testing persistence) + API-driven logs  
- **Styling**: Modern animated UI  

---

## ⚙️ Installation  

# bash
# Clone repo
git clone https://github.com/little151/StreakMind-v2.git

# Move into project
cd StreakMind

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install



## 🔮 Roadmap
 Chat-powered activity logging

 Tile-based dashboard

 Personality toggles

 CRUD operations for activities

 Cloud sync & multi-device support

 Mobile app version

 Streak-based rewards system

## DARK THEME (DEFAULT)

<img width="1919" height="928" alt="image" src="https://github.com/user-attachments/assets/7fb603c2-d4ae-4323-b35a-1212b7e445b7" />

<img width="1918" height="928" alt="image" src="https://github.com/user-attachments/assets/fb5afd61-a391-451d-8487-20c59299ca76" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4204f56d-f372-4c48-a327-25be6aa46084" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fd8898a5-c9f5-41e4-9b13-1e4ba30a93f1" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/cf0ebfe7-220c-4a56-85bd-97e981c1d804" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5af1cea4-4a54-4be7-a3c2-eb3c96172f69" />

## LIGHT THEME

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7fa1ecb7-9eec-423b-a029-f1175952588a" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/859ba0d2-3842-4cf9-bb58-c1ded2d03c3c" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/76e98b59-43fe-4b93-abe8-e82a528b5bbc" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/23e56c3e-956d-468f-8610-341c754aca41" />


