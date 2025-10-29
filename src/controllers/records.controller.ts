import { Request, Response } from "express";
import { RecordsService } from "../services/records.service";

export class RecordsController {
    static uploadCsvRecords = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ message: "No CSV file uploaded" });
            }
            const csvBuffer = req.file.buffer;
            const result = await RecordsService.processCsv(csvBuffer);
            res.status(200).json({ message: "Records processed", result });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };

    static getHistoricSummary = async (req: Request, res: Response) => {
        try {
            const result = await RecordsService.getHistoricUsageSummary();
            res.status(200).json({ message: "Historic Summary", result });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };

    static getTodaySoapAndTowelSummary = async (
        req: Request,
        res: Response
    ) => {
        try {
            const result = await RecordsService.getTodaySoapAndTowelSummary();
            res.status(200).json({
                message: "Today's Soap and Towel Summary",
                result,
            });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };

    static getLatestRecords = async (req: Request, res: Response) => {
        try {
            const result = await RecordsService.getLatestRecords();
            res.status(200).json({ message: "Latest Records", result });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };
}
