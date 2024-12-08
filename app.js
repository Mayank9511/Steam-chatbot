require("dotenv").config();

const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: "*", methods: ["POST", "GET", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

// Function to generate text
const generateText = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    console.log(prompt, " -> ",result.response.text());
    return result.response.text(); // Return the generated text
  } catch (error) {
    console.error("Error generating text:", error.message);
    throw new Error("Failed to generate text");
  }
};

// Route: POST /steam/ask
app.post("/steam/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid request: 'prompt' is required and must be a string." });
  }

  try {
    const response = await generateText(prompt);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route: GET /
app.get("/", (req, res) => {
  res.send("Hello from STEAM!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
