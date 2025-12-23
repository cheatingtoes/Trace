// require('dotenv').config();
const config = require('./config');
require('./config/passport');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const { corsOptions } = require('./config/cors');

const app = express();
const port = config.app.port;

// --- Middleware ---
// 1. CORS: Must be first to handle preflight requests.
app.use(cors(corsOptions)); // Allow cross-origin requests

// 2. Cookie Parser: To read cookies.
app.use(cookieParser());

// 3. JSON Body Parser: To read JSON bodies.
app.use(express.json()); // Parse JSON bodies

// --- API Routes ---
const authRoutes = require('./routes/auth.routes');
const usersRouter = require('./routes/users.routes');
const activitiesRouter = require('./routes/activities.routes');
const tracksRouter = require('./routes/tracks.routes');
const polylinesRouter = require('./routes/polylines.routes');
const momentsRouter = require('./routes/moments.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/activities', activitiesRouter);
app.use('/api/v1/tracks', tracksRouter);
app.use('/api/v1/polylines', polylinesRouter);
app.use('/api/v1/moments', momentsRouter);

// --- Server Root ---
app.get('/', (req, res) => {
    res.send('Trace API is running.');
});

// --- Centralized Error Handling ---
// This middleware catches all errors passed by next(err)
app.use((err, req, res, next) => {
    console.error(err.stack); // For debugging purposes
    
    // If headers have already been sent, delegate to the default handler
    if (res.headersSent) {
        return next(err);
    }

    // Use the status code from the error if it exists, otherwise default to 500
    const statusCode = err.statusCode || 500;
    // Use the message from the error, or a generic message
    const message = err.message || 'An unexpected error occurred on the server.';
    
    res.status(statusCode).json({ error: message });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = { app, server };