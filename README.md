# 🤖 Interaction AI — Multi-Modal AI System

A real-time, context-aware AI interaction platform that enables users to communicate with an AI assistant through text and voice. Built with React, Node.js, Express, MongoDB, Socket.IO, and Groq AI.

## ✨ Features

- **Text-Based Chat:** Interact with an AI assistant through a real-time chat interface.
- **Voice Input:** Convert speech into text using Speech-to-Text.
- **AI Voice Output:** Listen to AI responses using Text-to-Speech.
- **Contextual Memory:** Maintain conversation context for more relevant responses.
- **Personalization:** Adapt interaction style based on stored user preferences.
- **Real-Time Communication:** Powered by Socket.IO.
- **Modern UI:** Responsive interface with animations and a glassmorphism-inspired design.
- **AI Integration:** Groq-powered AI response generation.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time | Socket.IO |
| AI Integration | Groq API |
| Icons | Lucide React |

## 🏗️ Project Structure

```text
Artificial-Intelligence-Based-Interaction-System1/
│
├── backend/
│   ├── services/
│   │   └── aiService.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
├── INSTALL.md
├── README.md
└── vercel.json
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Groq API Key

### 1. Clone the Repository

```bash
git clone https://github.com/Deepanshu-star-1/Artificial-Intelligence-Based-Interaction-System1.git

cd Artificial-Intelligence-Based-Interaction-System1
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5001
FRONTEND_ORIGINS=http://localhost:5174
MONGO_URI=mongodb://localhost:27017/ai-interaction

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

Start the backend:

```bash
npm start
```

Backend runs at:

`http://localhost:5001`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5174`

## 🚀 How to Use

1. Start the backend and frontend servers.
2. Open the frontend in your browser.
3. Type a message to interact with the AI assistant.
4. Use the microphone option for voice input.
5. Enable AI voice output to listen to responses.
6. Continue the conversation with contextual interactions.

## 🔐 Environment Variables & Security

- Never commit your `.env` file.
- Keep API keys and database credentials private.
- Use `.env.example` as a configuration reference.
- Do not expose secret credentials in frontend code.

## 🔮 Future Improvements

- User authentication and profile management.
- Enhanced long-term conversational memory.
- Additional AI model integrations.
- More advanced multimodal capabilities.
- Production deployment and monitoring.

## 📄 License

No license has currently been specified. Please check the repository's licensing terms before reusing or distributing the code.

---

**Note:** This project builds on an existing codebase and includes local configuration and integration updates. See the Git history for changes.