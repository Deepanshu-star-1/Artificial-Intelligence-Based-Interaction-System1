require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ["GET", "POST"]
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection Utility for Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
      const error = new Error('MONGO_URI is missing');
      error.code = 'DATABASE_CONFIGURATION_ERROR';
      throw error;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // On Vercel, we want to know if it's an IP whitelist issue
    if (err.message.includes('ETIMEOUT') || err.message.includes('ECONNREFUSED')) {
      const error = new Error('Database connection timeout');
      error.code = 'DATABASE_CONNECTION_ERROR';
      throw error;
    }
    const error = new Error('Database connection failed');
    error.code = err.code === 'DATABASE_CONFIGURATION_ERROR'
      ? 'DATABASE_CONFIGURATION_ERROR'
      : 'DATABASE_CONNECTION_ERROR';
    throw error;
  }
};

const aiService = require('./services/aiService');

// Health Check for Vercel Debugging
app.get('/api/health', async (req, res) => {
  await connectDB().catch(() => {});
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: {
      has_mongo: !!process.env.MONGO_URI,
      has_groq: !!process.env.GROQ_API_KEY
    }
  });
});

// REST API for Vercel Compatibility (Socket.io doesn't work on Vercel Serverless)
app.post('/api/chat', async (req, res) => {
  try {
    await connectDB();
    const { text, modality, mode, image, userId = 'anonymous' } = req.body;
    console.log('Chat request received:', text, 'mode:', mode, 'hasImage:', !!image);
    
    if (!process.env.GROQ_API_KEY) {
      console.error('CRITICAL: GROQ_API_KEY is missing!');
      return res.status(503).json({
        message: 'AI service is not configured. Please contact the administrator.'
      });
    }

    const aiResponse = await aiService.processInteraction(userId, text, modality, mode, image);
    res.json({
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('API Error:', error.message);

    if (error.code === 'DATABASE_CONNECTION_ERROR' || error.code === 'DATABASE_CONFIGURATION_ERROR') {
      return res.status(503).json({
        message: 'Database is unavailable. Please try again later.'
      });
    }

    if (error.code === 'AI_CONFIGURATION_ERROR') {
      return res.status(503).json({
        message: 'AI service is not configured. Please contact the administrator.'
      });
    }

    if (error.code === 'AI_AUTHENTICATION_ERROR') {
      return res.status(502).json({
        message: 'AI service authentication failed. Please contact the administrator.'
      });
    }

    const aiErrors = {
      AI_ACCESS_ERROR: [502, 'AI service access was denied. Please contact the administrator.'],
      AI_MODEL_NOT_FOUND: [502, 'The configured AI model is unavailable. Please contact the administrator.'],
      AI_RATE_LIMIT_ERROR: [429, 'AI service rate limit reached. Please try again later.'],
      AI_PROVIDER_ERROR: [503, 'AI service is temporarily unavailable. Please try again later.'],
      AI_SERVICE_ERROR: [502, 'AI service request failed. Please try again later.']
    };
    if (aiErrors[error.code]) {
      const [status, message] = aiErrors[error.code];
      return res.status(status).json({ message });
    }

    return res.status(500).json({
      message: 'Failed to process interaction. Please try again later.'
    });
  }
});


// Socket.io for Real-time Interaction
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', async (data) => {
    const { text, modality, mode, image, userId = 'anonymous' } = data;

    try {
      const aiResponse = await aiService.processInteraction(userId, text, modality, mode, image);

      socket.emit('receive_message', {
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Socket interaction error:', error.message);
      const message = error.code === 'AI_CONFIGURATION_ERROR'
        ? 'AI service is not configured. Please contact the administrator.'
        : error.code === 'AI_AUTHENTICATION_ERROR'
          ? 'AI service authentication failed. Please contact the administrator.'
          : error.code === 'AI_MODEL_NOT_FOUND'
            ? 'The configured AI model is unavailable. Please contact the administrator.'
            : error.code === 'AI_RATE_LIMIT_ERROR'
              ? 'AI service rate limit reached. Please try again later.'
          : 'Failed to process interaction. Please try again later.';
      socket.emit('error', { message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use((error, req, res, next) => {
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: 'Origin is not allowed.' });
  }

  return next(error);
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
