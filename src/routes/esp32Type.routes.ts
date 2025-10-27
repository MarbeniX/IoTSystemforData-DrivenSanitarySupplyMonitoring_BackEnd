import { Router } from "express";
import { body } from "express-validator";
import { ESP32TypeController } from "../controllers/esp32Type.controller";
import { handleInputErrors } from "../middlewares/handleInputErrors.middleware";
import { alertMessageValues, espTypeValues } from "../models/esp32Alerts.model";

const router = Router();

router.get("/", ESP32TypeController.getAlerts);

router.patch(
    "/",
    body("espType").isInt().isIn(espTypeValues).notEmpty(),
    body("alertMessage").isInt().isIn(alertMessageValues).notEmpty(),
    handleInputErrors,
    ESP32TypeController.updateAlert
);

export default router;
