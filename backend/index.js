import express from "express";
import { connectDB } from "./db/connectDB.js";
//when importing modules put '.js' at the end of imports
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();
dotenv.config();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json()); //parse incoming req
app.use(cookieParser()); //extract jwt token etc from cookies

app.get("/", (req, res) => {
  console.log("inside root route");
  res.status(200).send("Hello");
});

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
  connectDB();
  console.log("server is running on port 5000");
});
