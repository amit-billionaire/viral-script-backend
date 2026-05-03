import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
// your other code below...

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set your ffmpeg path

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/api/generate-script", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
  return res.status(400).send("No file uploaded");
}
    console.log("Video received:", req.file);

    const inputPath = req.file.path;
    const framesFolder = `uploads/frames-${Date.now()}`;

    if (!fs.existsSync(framesFolder)) {
      fs.mkdirSync(framesFolder);
    }

    ffmpeg(inputPath)
      .output(`${framesFolder}/frame-%03d.jpg`)
      .outputOptions(["-vf", "fps=1"])
      .on("end", async () => {
        try {
          const files = fs.readdirSync(framesFolder);
          const selectedFrames = files.slice(0, 5);

          const imageInputs = selectedFrames.map((file) => {
            const imagePath = `${framesFolder}/${file}`;
            const imageBase64 = fs.readFileSync(imagePath, {
              encoding: "base64",
            });

            return {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            };
          });

          const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: `You are a viral YouTube Shorts script writer.

You MUST follow this style EXACTLY. No deviation.

STYLE RULES (STRICT):
- ALWAYS start with "Look,"
- ALWAYS use a strong hook about China being ahead (e.g., "that's why Chinese farmers are 50 years ahead of us" OR similar)
- Hook must create curiosity + shock
- Use VERY simple English
- Use step-by-step storytelling: "First," "Then," "After that"
- Add suspense: "but then something unexpected happens"
- NEVER be generic
- NEVER guess random things
- ONLY describe what is clearly happening in the images
- Make it feel smart, surprising, and valuable
- ALWAYS end with money/value (e.g., "sold for hundreds of dollars", "makes thousands")

STRUCTURE (MANDATORY):
1. Hook (China + curiosity)
2. Step 1 (what is happening)
3. Step 2
4. Step 3
5. Suspense moment
6. Final reveal
7. Money/value ending

IMPORTANT:
- If the images show collecting eggs → talk about eggs
- If animals → talk about animals
- If tools → describe tools
- Stay visually accurate

OUTPUT:
- One short paragraph
- No extra explanation
- No emojis
- No titles

Now analyze the images and generate the script.`,
                  },
                  ...imageInputs,
                ],
              },
            ],
          });

          const script = response.output[0].content[0].text;

          res.json({
            message: "Script generated",
            script: script,
          });
        } catch (err) {
          console.error("AI Error:", err);
          res.status(500).send("AI processing error");
        }
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).send("Frame extraction error");
      })
      .run();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
