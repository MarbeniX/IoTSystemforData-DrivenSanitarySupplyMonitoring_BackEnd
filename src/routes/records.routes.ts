import { query } from "express-validator";
import { Router } from "express";
import multer from "multer";
import { RecordsController } from "../controllers/records.controller";
import { sensorTypeValues } from "../interfaces";
import { handleInputErrors } from "../middlewares/handleInputErrors.middleware";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("csvFile"), RecordsController.uploadCsvRecords);
router.get(
    "/historic-summary",
    query("day", "Day format must be YYYY-MM-DD").optional().isISO8601(),
    query("month", "Month format must be YYYY-MM")
        .matches(/^\d{4}-\d{2}$/)
        .optional(),
    query("year", "Year format must be YYYY").isInt({ min: 2025 }).optional(),
    handleInputErrors,
    RecordsController.getHistoricSummary
);
router.get(
    "/today-soap-towel-summary",
    RecordsController.getTodaySoapAndTowelSummary
);

router.get(
    "/latest-records",
    query("limit", "Limit must be an integer of at least 10")
        .optional()
        .isInt({ min: 10 }),
    handleInputErrors,
    RecordsController.getLatestRecords
);
router.get(
    "/monthly-or-yearly-records-by-supply-type",
    query("supplyType", "supplyType is required")
        .isInt()
        .isIn(sensorTypeValues)
        .withMessage(
            `supplyType must be one of: ${sensorTypeValues.join(", ")}`
        )
        .notEmpty(),
    query("month", "Month format must be YYYY-MM")
        .matches(/^\d{4}-\d{2}$/)
        .optional(),
    query("year", "Year format must be YYYY")
        .isInt({ min: 2025 })
        .withMessage("Minimun year is 2025")
        .optional(),
    query().custom((value, { req }) => {
        if (!req.query.month && !req.query.year) {
            throw new Error("At least one of 'month' or 'year' is required");
        }
        if (req.query.month && req.query.year) {
            throw new Error("Only one of 'month' or 'year' should be provided");
        }
        return true;
    }),
    handleInputErrors,
    RecordsController.getMontlyOrYearlyRecordsBySupplyType
);

router.get(
    "/day-month-or-year-supplies-records",
    query("day", "Day format must be YYYY-MM-DD").optional().isISO8601(),
    query("month", "Month format must be YYYY-MM")
        .matches(/^\d{4}-\d{2}$/)
        .optional(),
    query("year", "Year format must be YYYY")
        .isInt({ min: 2025 })
        .withMessage("Minimun year is 2025")
        .optional(),
    query().custom((value, { req }) => {
        const providedKeys = ["day", "month", "year"].filter((k) => {
            const v = req.query[k];
            if (v === undefined) return false;
            if (Array.isArray(v))
                return v.some((item) => String(item).trim() !== "");
            return String(v).trim() !== "";
        });
        if (!req.query.month && !req.query.year && !req.query.day) {
            throw new Error(
                "At least one of 'day', 'month' or 'year' is required"
            );
        } else if (providedKeys.length > 1) {
            throw new Error(
                "Only one of 'day', 'month' or 'year' should be provided"
            );
        }
        return true;
    }),
    handleInputErrors,
    RecordsController.getSuppliesRecordsByDayOrMonthOrYear
);

export default router;
