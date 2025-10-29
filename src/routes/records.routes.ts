import { Router } from "express";
import multer from "multer";
import { RecordsController } from "../controllers/records.controller";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("csvFile"), RecordsController.uploadCsvRecords);
router.get("/historic-summary", RecordsController.getHistoricSummary);
router.get(
    "/today-soap-towel-summary",
    RecordsController.getTodaySoapAndTowelSummary
);

export default router;
