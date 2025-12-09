require('dotenv').config();
const express = require('express');
const multer = require('multer');
const exifr = require('exifr');
const fs = require('fs');
const connectDB = require('./config/db');
const Photo = require('./models/Photo');
const Activity = require('./models/Activity');
const Route = require('./models/Route');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests from the frontend

// Connect to Database (will attempt connection on start)
connectDB();

// Configure Multer for file uploads
const upload = multer({ dest: './temp_uploads/' }); 

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Trace API is running and connected to MongoDB!');
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});