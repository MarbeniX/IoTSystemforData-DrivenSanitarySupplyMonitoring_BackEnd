import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/handleInputErrors.middleware";
import { SensorTypeConfigController } from "../controllers/sensorTypeConfig.controller";

const router = Router();

router.get("/sensor-type-config", SensorTypeConfigController.getConfig);

router.patch(
    "/sensor-type-config",
    body("soapCapacity").isNumeric().optional(),
    body("soapDispensePerUse").isNumeric().optional(),
    body("tankFlushCapacity").isNumeric().optional(),
    body("totalTowelLength").isNumeric().optional(),
    body("towelLengthPerUse").isNumeric().optional(),
    body("watterPressure").isNumeric().optional(),
    handleInputErrors,
    SensorTypeConfigController.updateConfig
);

export default router;
