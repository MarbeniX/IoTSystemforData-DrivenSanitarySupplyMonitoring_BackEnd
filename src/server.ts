import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import esp32TypeRoutes from "./routes/esp32Type.routes";
import sensorTypeConfigRoutes from "./routes/sensorTypeConfig.routes";
import recordsRoutes from "./routes/records.routes";
import { corsConfig } from "./config/cors";

dotenv.config();
connectDB();

const app = express();
app.use(cors(corsConfig));
app.use(morgan("dev"));
app.use(express.json());

app.use("/esp32Type", esp32TypeRoutes);
app.use("/sensorTypeConfig", sensorTypeConfigRoutes);
app.use("/records", recordsRoutes);

export default app;
