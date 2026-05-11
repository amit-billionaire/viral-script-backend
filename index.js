import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend is LIVE!");
});

app.get("/test", (req, res) => {
  res.json({
    success: true
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
