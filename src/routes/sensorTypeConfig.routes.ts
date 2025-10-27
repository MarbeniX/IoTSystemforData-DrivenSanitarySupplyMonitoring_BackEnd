import { Router } from "express";
import { body } from "express-validator";
import { handleInputErrors } from "../middlewares/handleInputErrors.middleware";
import { SensorTypeConfigController } from "../controllers/sensorTypeConfig.controller";

const router = Router();

router.get("/", SensorTypeConfigController.getConfig);

router.patch(
    "/",
    body("soapCapacity")
        .isNumeric()
        .withMessage("Must be a numeric value")
        .optional(),
    body("soapDispensePerUse")
        .isNumeric()
        .withMessage("Must be a numeric value")
        .optional(),
    body("tankFlushCapacity")
        .isNumeric()
        .withMessage("Must be a numeric value")
        .optional(),
    body("totalTowelLength")
        .isNumeric()
        .withMessage("Must be a numeric value")
        .optional(),
    body("towelLengthPerUse")
        .isNumeric()
        .withMessage("Must be a numeric value")
        .optional(),
    body("watterPressure")
        .isNumeric()
        .withMessage("Must be a numeric value")
        .optional(),
    handleInputErrors,
    SensorTypeConfigController.updateConfig
);

export default router;
