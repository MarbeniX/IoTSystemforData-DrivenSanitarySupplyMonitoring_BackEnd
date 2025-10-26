import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import esp32TypeRoutes from "./routes/esp32Type.routes";
import sensorTypeConfigRoutes from "./routes/sensorTypeConfig.routes";

dotenv.config();
connectDB();

const app = express();
app.use(morgan("dev"));
app.use(express.json());

//
app.use("/api/esp32Type", esp32TypeRoutes);
app.use("/api/sensorTypeConfig", sensorTypeConfigRoutes);

export default app;
