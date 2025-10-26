import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/handleInputErrors.middleware";
import { SensorTypeConfigController } from "../controllers/sensorTypeConfig.controller";

const router = Router();

router.get("/sensor-type-config", SensorTypeConfigController.getConfig);

router.patch(
    "/sensor-type-config",
    [
        body("soapCapacity", "Debe ser un valor numérico")
            .isNumeric()
            .optional(),
        body("soapDispensePerUse", "Debe ser un valor numérico")
            .isNumeric()
            .optional(),
        body("tankFlushCapacity", "Debe ser un valor numérico")
            .isNumeric()
            .optional(),
        body("totalTowelLength", "Debe ser un valor numérico")
            .isNumeric()
            .optional(),
        body("towelLengthPerUse", "Debe ser un valor numérico")
            .isNumeric()
            .optional(),
        body("watterPressure", "Debe ser un valor numérico")
            .isNumeric()
            .optional(),
    ],
    handleInputErrors,
    SensorTypeConfigController.updateConfig
);

export default router;
