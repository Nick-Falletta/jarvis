Got it — here’s a **clean, professional README** without emojis, project structure, license, or future improvements:

---

# Jarvis Chatbot

Jarvis Chatbot is an interactive AI-powered assistant built with React, Bootstrap, and Express, integrated with the OpenAI API. It provides conversational AI responses, voice interaction, dynamic CSS modification, and an optional Dungeon Master personality mode.

---

## Features

* **Conversational AI**

  * Default mode: AI responds with a snarky Dungeon Master tone.
  * Jarvis mode: AI can modify CSS dynamically and summarize the changes.

* **Dynamic Styling with AI**

  * Users can request CSS modifications such as background color changes.
  * AI updates and applies CSS changes in real time.

* **Voice Features**

  * Speech-to-Text for dictating messages.
  * Text-to-Speech for AI responses with voice output.

* **Chat Management**

  * Clear chat history.
  * Copy AI responses to clipboard.
  * Automatic scrolling for new messages.

* **Typing Animation**

  * AI responses appear with a typewriter effect for a natural flow.

* **Example Mode**

  * Loads sample conversations for demonstration purposes.

---

## Tech Stack

**Frontend**

* React
* Bootstrap (CSS and JavaScript)
* Bootstrap Icons
* Axios

**Backend**

* Node.js with Express
* OpenAI API (`gpt-4o-mini`)

---

## Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/jarvis-chatbot.git
cd jarvis-chatbot
```

### 2. Frontend Setup

```bash
cd aiChatBot
npm install
npm run dev   # Start frontend (Vite)
```

### 3. Backend Setup

```bash
cd ..
npm install
npm start     # Start backend (Express on port 3000)
```

---

## Configuration

Create an `.env` file in the backend root with your OpenAI API key:

```
OPENAI_API_KEY=your-api-key-here
```

When deploying, the backend serves the frontend build:

```bash
cd aiChatBot
npm run build
cd ..
npm start
```

---

## API Endpoint

### `POST /chat`

**Request Body (default mode):**

```json
{
  "userMsg": "Tell me a story",
  "userMsgList": [],
  "aiMsgList": []
}
```

**Request Body (Jarvis mode):**

```json
{
  "userMsg": "Change background to blue",
  "userMsgList": [],
  "aiMsgList": [],
  "cssContent": "/* existing css */",
  "jarvisBool": true
}
```

**Response Example (Jarvis mode):**

```json
{
  "updatedCSS": "body { background: blue; }",
  "summary": "Background color changed to blue."
}
```

---

## Usage Guide

* Type a message in the input field and press send.
* Use the microphone button for voice input.
* Click "Clear Chat" to reset the conversation.
* Enable Jarvis mode to let AI modify CSS dynamically.
* Use the copy button to copy AI responses.

---

Do you want me to also make a **short version** (1-page style) README that’s more concise for GitHub, or keep this detailed version?
