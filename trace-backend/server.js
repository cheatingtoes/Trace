require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Renamed from connectDB for consistency, db is the knex instance

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// --- API Routes ---
const usersRouter = require('./routes/users');
const activitiesRouter = require('./routes/activities');
const routesRouter = require('./routes/routes');
const polylinesRouter = require('./routes/polylines');
const momentsRouter = require('./routes/moments');

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/activities', activitiesRouter);
app.use('/api/v1/routes', routesRouter);
app.use('/api/v1/polylines', polylinesRouter);
app.use('/api/v1/moments', momentsRouter);

// --- Server Root ---
app.get('/', (req, res) => {
    res.send('Trace API is running.');
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = { app, server };