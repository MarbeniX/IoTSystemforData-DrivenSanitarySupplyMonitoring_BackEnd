import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();
connectDB();

const app = express();
app.use(morgan("dev"));
app.use(express.json());

//Routes

export default app;
