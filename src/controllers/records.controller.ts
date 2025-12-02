import { Request, Response } from "express";
import { RecordsService } from "../services/records.service";
import { IChartQueryOptions } from "../interfaces";

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
            const { day, month, year } = req.query;
            const options = {
                day: day as string,
                month: month as string,
                year: year as string,
            };
            const result = await RecordsService.getHistoricUsageSummary(
                options
            );
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
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const result = await RecordsService.getLatestRecords(limit);
            res.status(200).json({ message: "Latest Records", result });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };

    static getMontlyOrYearlyRecordsBySupplyType = async (
        req: Request,
        res: Response
    ) => {
        try {
            const { supplyType, month, year } = req.query;
            const options: IChartQueryOptions = {
                supplyType: parseInt(supplyType as string, 10),
                month: month as string,
                year: year as string,
            };
            const result = await RecordsService.getRecordsByPeriod(options);
            res.status(200).json({ message: "Records by Periods", result });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };

    static getSuppliesRecordsByDayOrMonthOrYear = async (
        req: Request,
        res: Response
    ) => {
        try {
            const { day, month, year } = req.query;
            const options = {
                day: day as string,
                month: month as string,
                year: year as string,
            };
            const result =
                await RecordsService.getSuppliesRecordsByDayOrMonthOrYear(
                    options
                );
            res.status(200).json({ message: "Supplies Records", result });
        } catch (error) {
            res.status(500).json({
                message: "Server Error",
                error: error.message,
            });
        }
    };

    static getLatestRecordTimestamp = async (req: Request, res: Response) => {
        try {
            const result = await RecordsService.getLatestRecordTimestamp();
            res.status(200).json({
                message: "Latest Record Timestamp",
                result,
            });
        } catch (error) {
            res.status(500).json({ message: "Server Error", error });
        }
    };
}
