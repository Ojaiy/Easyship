const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');

const trackRoutes = require("./SRC/routes/trackRoutes.js");
const Tracking = require("./SRC/models/trackingSchema.js");
const userRoutes = require("./SRC/routes/userRoutes.js");
const vendorRoutes = require("./SRC/routes/vendorRoutes.js");

const app = express();

/* =======================
   MIDDLEWARE (IMPORTANT ORDER)
======================= */

// CORS FIRST (critical fix for OPTIONS error)
app.use(cors({
  origin: "https://easyship-brown.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests
app.options("*", cors());

// Body parser
app.use(express.json());

/* =======================
   SOCKET IO
======================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("update-location", async ({ orderId, location }) => {
    try {
      const tracking = await Tracking.findOneAndUpdate(
        { orderId },
        { currentLocation: location },
        { new: true }
      );

      if (tracking) {
        io.emit("location-updated", { orderId, location });
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

/* =======================
   MULTER
======================= */
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'vendorUploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  }
});

const vendorUpload = multer({ storage: fileStorageEngine });

app.post("/multiple", vendorUpload.array('images', 4), (req, res) => {
  res.send('Files uploaded successfully');
});

/* =======================
   ROUTES (AFTER MIDDLEWARE)
======================= */
app.use("/api/v1", trackRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", vendorRoutes);

app.get('/', (req, res) => {
  res.send('EASYSHIP NG');
});

/* =======================
   SERVER START
======================= */
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("Connected to MongoDB");

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

  } catch (err) {
    console.log("MongoDB connection failed:", err.message);
  }
};

startServer();