import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import esp32TypeRoutes from "./routes/esp32Type.routes";
import sensorTypeConfigRoutes from "./routes/sensorTypeConfig.routes";
import recordsRoutes from "./routes/records.routes";

dotenv.config();
connectDB();

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/sensorTypeConfig", sensorTypeConfigRoutes);
app.use("/api/esp32Type", esp32TypeRoutes);
app.use("/api/records", recordsRoutes);

export default app;
