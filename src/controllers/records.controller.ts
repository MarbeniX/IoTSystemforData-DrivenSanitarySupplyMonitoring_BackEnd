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

    static getRecords = async (req: Request, res: Response) => {
        try {
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };
}
