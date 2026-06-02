const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
// const path = require('path');

const trackRoutes = require("./SRC/routes/trackRoutes.js");
const Tracking = require("./SRC/models/trackingSchema.js");
const userRoutes = require("./SRC/routes/userRoutes.js");
const vendorRoutes = require("./SRC/routes/vendorRoutes.js")

const app = express();
app.use(express.json());
app.use(cors());



const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// WebSocket Setup for Live Tracking
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

// Multer for upload
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'vendorUploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  }
});

const vendorUpload = multer({storage: fileStorageEngine})

app.post("/multiple", vendorUpload.array('images', 4), (req,res) =>{
  res.send('Files uploaded successfully')
});

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('Connected to easyship MongoDB database');
}).catch(err=>{
    console.log('Failed to connect to MongoDB', err)
})

app.use("/api/v1", trackRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", vendorRoutes);

// app.use("/api/v1", uploadRoutes);
app.get('/', (req, res) => {
    res.send('EASYSHIP NG');
})

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})