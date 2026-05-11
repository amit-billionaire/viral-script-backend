import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const upload = multer({
  storage: multer.memoryStorage()
});

app.post("/api/generate-script", upload.single("video"), async (req, res) => {
  console.log("API HIT");

  return res.json({
    script: "✅ Backend is working perfectly!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
