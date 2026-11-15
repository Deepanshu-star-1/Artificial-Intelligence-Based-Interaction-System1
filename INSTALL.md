# Installation Guide

Follow these steps to get the AI-Based Interaction System running on your local machine.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally (or a MongoDB Atlas URI)

## 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the `backend` folder (if not already present).
   - Add your configuration:
     ```env
     PORT=5001
     FRONTEND_ORIGINS=http://localhost:5174
     MONGO_URI=mongodb://localhost:27017/ai-interaction
     GROQ_API_KEY=your_groq_api_key_here
     GROQ_MODEL=openai/gpt-oss-20b
     GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
     ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will start on http://localhost:5001*

## 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at http://localhost:5174*

## 3. Using the System

- **Text Chat**: Simply type in the input field and press Enter.
- **Voice Input**: Click the microphone icon to start speaking. The system will convert your speech to text and send it.
- **AI Voice Controls**: 
  - Click the speaker icon in the header to toggle global AI voice output.
  - While the AI is speaking, click the **Stop Speech** button in the header (or press the **`Escape`** key) to pause speaking at any time.
  - Click the green **Resume** button on the message bubble to continue speaking from where it was paused, or click the **Restart** (`RotateCcw` icon) button to start from the beginning.
  - Starting microphone dictation or toggling off the speaker icon will automatically pause any active AI speech.
