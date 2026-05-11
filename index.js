import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend is LIVE!");
});

/* MULTER */
const upload = multer({
  storage: multer.memoryStorage()
});

/* API ROUTE */
app.post("/api/generate-script", upload.single("video"), async (req, res) => {

  console.log("API HIT");

  try {

    if (!req.file) {
      return res.status(400).json({
        error: "No video uploaded"
      });
    }

    return res.json({
      script: "✅ Backend is working perfectly!"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
});

/* SERVER */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
