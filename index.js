const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');

const adminRiderRoutes = require('./SRC/routes/adminRiderRoutes.js');
const adminRoutes      = require('./SRC/routes/adminRoutes.js');
const trackRoutes      = require('./SRC/routes/trackRoutes.js');
const userRoutes       = require('./SRC/routes/userRoutes.js');
const orderRoutes      = require('./SRC/routes/orderRoutes.js');
const riderRoutes      = require('./SRC/routes/riderRoutes');

const app = express();

/* =======================
   1. CORS (FIXED)
======================= */
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['https://easyship-brown.vercel.app'];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    // allow server-to-server or Postman requests
    if (!origin) return next();

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

/* =======================
   2. BODY PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   3. STATIC FILES
======================= */
app.use(express.static(path.join(__dirname, '../Easyship-frontend')));

/* =======================
   4. ROOT ROUTE
======================= */
app.get('/', (req, res) => {
    res.redirect('/User/index.html');
});

/* =======================
   5. MULTER
======================= */
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'vendorUploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '--' + file.originalname),
});

const vendorUpload = multer({ storage: fileStorageEngine });

app.post('/multiple', vendorUpload.array('images', 4), (req, res) => {
    res.json({ success: true, message: 'Files uploaded successfully' });
});

/* =======================
   6. SOCKET.IO
======================= */
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },
});

// Attach io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('join_rider_room', (riderId) => {
        socket.join(`rider_${riderId}`);
        console.log(`Rider ${riderId} joined rider room`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

module.exports.io = io;

/* =======================
   7. API ROUTES
======================= */
app.use('/api/v1', adminRoutes);
app.use('/api/v1', trackRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', riderRoutes);
app.use('/api/v1', adminRiderRoutes);

/* =======================
   8. 404 + ERROR HANDLERS
======================= */
app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

/* =======================
   9. START SERVER
======================= */
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        server.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });

    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

startServer();