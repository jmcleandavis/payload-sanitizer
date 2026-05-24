import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sanitizePayload } from './utils/sanitizer.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Tighten CORS limits based on environment variables
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.post('/api/sanitize', (req, res, next) => {
  try {
    const { payload, options } = req.body;

    if (!payload) {
      const error = new Error('Missing target payload data.');
      error.statusCode = 400;
      throw error;
    }

    // Ensure we are working with an object or array
    const parsedData = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const sanitized = sanitizePayload(parsedData, options || {});

    return res.status(200).json({
      success: true,
      data: sanitized
    });
  } catch (err) {
    // Explicitly handle JSON syntax errors from bad inputs
    if (err instanceof SyntaxError) {
      err.statusCode = 400;
      err.message = 'Invalid JSON structure detected.';
    }
    next(err);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sanitization engine operating cleanly on port ${PORT}`);
});
