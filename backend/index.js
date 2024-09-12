import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); // Parse incoming requests
app.use(cookieParser()); // Extract JWT tokens, etc., from cookies

app.use("/api/auth", authRoutes);

// console.log("process.env.NODE_ENV  : ", process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
