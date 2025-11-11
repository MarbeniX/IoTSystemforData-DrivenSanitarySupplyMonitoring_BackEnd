import csvParser from "csv-parser";
import { Readable } from "stream"; // Para convertir el Buffer en un Stream
import SensorRecord, {
    ISensorRecord,
    SensorRecordData,
} from "../models/sensorRecord.model";
import {
    IChartQueryOptions,
    IHistoricRecordSummary,
    IQueryOptions,
    SensorType,
    SensorTypeValues,
    sensorTypeValues,
} from "../interfaces";
import mongoose from "mongoose";

export class RecordsService {
    static processCsv = async (
        csvBuffer: Buffer
    ): Promise<{ insertedCount: number }> => {
        const stream = Readable.from(csvBuffer);
        const parsedRows: any[] = await this.parseCsvStream(stream);

        const recordsToInsert: SensorRecordData[] = parsedRows
            .map((row) => {
                try {
                    const sensorType = parseInt(row.id, 10);
                    const isoString = `${row.date}T${row.time}`;
                    const timestamp = new Date(isoString);
                    const waterActiveTime = parseInt(row.sec, 10);
                    const revolutions = parseInt(row.rev, 10);

                    if (isNaN(sensorType) || isNaN(timestamp.getTime())) {
                        console.warn(
                            "Invalid sensorType or timestamp, skipping row:",
                            row
                        );
                        return null;
                    }

                    const record: Partial<ISensorRecord> = {
                        sensorType: sensorType,
                        timestamp: timestamp,
                    };
                    if (!isNaN(waterActiveTime) && waterActiveTime > 0) {
                        record.seconds = waterActiveTime;
                    }
                    if (!isNaN(revolutions) && revolutions > 0) {
                        record.revolutions = revolutions;
                    }
                    return record as SensorRecordData;
                } catch (e) {
                    console.warn("Error parsing row, skipping:", row, e);
                    return null;
                }
            })
            .filter((record) => record !== null);

        if (recordsToInsert.length === 0) {
            console.log("No valid records found in CSV.");
            return { insertedCount: 0 };
        }

        const result = await SensorRecord.insertMany(recordsToInsert, {
            ordered: false,
        });
        return { insertedCount: result.length };
    };

    private static parseCsvStream = (stream: Readable): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            stream
                .pipe(csvParser())
                .on("data", (data) => results.push(data))
                .on("end", () => resolve(results))
                .on("error", (error) => reject(error));
        });
    };

    static getHistoricUsageSummary = async (
        query: IQueryOptions
    ): Promise<IHistoricRecordSummary[]> => {
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        const { day, month, year } = query;

        if (day) {
            startDate = new Date(`${day}T00:00:00.000Z`);
            endDate = new Date(`${day}T23:59:59.999Z`);
        } else if (month) {
            const [yearString, monthString] = month.split("-").map(Number);
            startDate = new Date(Date.UTC(yearString, monthString - 1, 1));
            const lastDay = new Date(
                Date.UTC(yearString, monthString, 0)
            ).getUTCDate();
            endDate = new Date(
                Date.UTC(yearString, monthString - 1, lastDay, 23, 59, 59, 999)
            );
        } else if (year) {
            const yearNumber = parseInt(year, 10);
            startDate = new Date(Date.UTC(yearNumber, 0, 1));
            endDate = new Date(Date.UTC(yearNumber, 11, 31, 23, 59, 59, 999));
        }

        const pipeline: any[] = [];
        if (startDate && endDate) {
            pipeline.push({
                $match: {
                    timestamp: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            });
        }
        pipeline.push({
            $group: {
                _id: "$sensorType",
                count: { $sum: 1 },
                totalSec: { $sum: "$seconds" },
            },
        });
        pipeline.push({
            $project: {
                _id: 0,
                sensorType: "$_id",
                count: 1,
                totalSec: 1,
            },
        });
        pipeline.push({ $sort: { sensorType: 1 } });

        const summary = await SensorRecord.aggregate(pipeline);
        const finalSummary: IHistoricRecordSummary[] = sensorTypeValues.map(
            (type: SensorTypeValues) => {
                const found = summary.find((s) => s.sensorType === type);
                if (found) {
                    if (found.sensorType !== 3) {
                        delete found.totalSec;
                    }
                    return found;
                }
                return { sensorType: type, count: 0 };
            }
        );
        return finalSummary;
    };

    static getTodaySoapAndTowelSummary = async (): Promise<{
        soapCount: number;
        towelCount: number;
    }> => {
        const startOfTheDay = new Date();
        startOfTheDay.setHours(0, 0, 0, 0);
        const endOfTheDay = new Date();
        endOfTheDay.setHours(23, 59, 59, 999);

        const SOAP_TYPE = sensorTypeValues[2];
        const TOWEL_TYPE = sensorTypeValues[4];

        const pipeline = [
            {
                $match: {
                    timestamp: {
                        $gte: startOfTheDay,
                        $lte: endOfTheDay,
                    },
                    sensorType: {
                        $in: [SOAP_TYPE, TOWEL_TYPE],
                    },
                },
            },
            {
                $group: {
                    _id: "$sensorType",
                    count: { $sum: 1 },
                },
            },
        ];

        const summary = await SensorRecord.aggregate(pipeline);
        let soapCount = 0;
        let towelCount = 0;
        for (const result of summary) {
            if (result._id === SOAP_TYPE) {
                soapCount = result.count;
            } else if (result._id === TOWEL_TYPE) {
                towelCount = result.count;
            }
        }

        return { soapCount, towelCount };
    };

    static getLatestRecords = async (
        limit: number
    ): Promise<ISensorRecord[]> => {
        const records = await SensorRecord.find({})
            .sort({ timestamp: -1 })
            .limit(limit);
        return records;
    };

    static getRecordsByPeriod = async (query: IChartQueryOptions) => {
        //Build pipleline, execute aggregation, fill missing periods
        const { supplyType, month, year } = query; //Parameters from query
        const pipeline = this.buildAggregationPipeline(query); //Build aggregation pipeline based on parameters
        const dbResults = await SensorRecord.aggregate(pipeline); //Execute aggregation
        const isWater = supplyType === SensorType.WATER; //Check if supplyType is WATER to include totalSec

        let filledResults = []; //Final results with missing periods filled
        if (year) {
            //If year is provided, fill missing months
            filledResults = this.fillMissingYearMonths(
                year,
                dbResults,
                isWater
            );
        } else if (month) {
            //If month is provided, fill missing days
            filledResults = this.fillMissingMonthDays(
                month,
                dbResults,
                isWater
            );
        } else {
            filledResults = [];
        }
        return filledResults;
    };

    private static buildAggregationPipeline = (
        query: IChartQueryOptions
    ): any[] => {
        const { supplyType, month, year } = query; //Parameters from query
        let startDate: Date;
        let endDate: Date;
        let dateFormat: string; //Variables for date range and grouping formats

        const pipeline: any[] = []; //Aggregation pipeline array

        const $match: any = {
            //Filter by supplyType
            sensorType: supplyType,
        };

        if (year) {
            //If year is provided
            const yearNumber = parseInt(year, 10);
            startDate = new Date(Date.UTC(yearNumber, 0, 1)); // 1st Jan
            endDate = new Date(Date.UTC(yearNumber, 11, 31, 23, 59, 59, 999)); // 31st Dec
            dateFormat = "%Y-%m"; // Group by month

            $match.timestamp = {
                //Filter by the date range previously set
                $gte: startDate,
                $lte: endDate,
            };
        } else if (month) {
            //if month is provided
            const [yearString, monthString] = month.split("-").map(Number); // Get year and month numbers from month string "YYYY-MM"
            startDate = new Date(Date.UTC(yearString, monthString - 1, 1)); // 1st of month

            const lastDay = new Date(
                Date.UTC(yearString, monthString, 0)
            ).getUTCDate(); // Last day of month

            endDate = new Date(
                Date.UTC(yearString, monthString - 1, lastDay, 23, 59, 59, 999)
            ); // End of last day

            dateFormat = "%Y-%m-%d"; // Group by day
            $match.timestamp = {
                //Filter by the date range previously set
                $gte: startDate,
                $lte: endDate,
            };

            $match.$expr = {
                //expr for advanced filtering. Aggregation expressoins
                //exclude weekends
                $and: [
                    // Monday to Friday
                    {
                        $gte: [
                            {
                                $dayOfWeek: {
                                    date: "$timestamp",
                                    timezone: "UTC",
                                },
                            },
                            2,
                        ],
                    }, // Monday=2
                    {
                        $lte: [
                            {
                                $dayOfWeek: {
                                    date: "$timestamp",
                                    timezone: "UTC",
                                },
                            },
                            6,
                        ],
                    }, // Friday=6
                ],
            };
        }

        pipeline.push({ $match }); //Add match stage to pipeline

        pipeline.push({
            //Group by date format
            $group: {
                _id: {
                    $dateToString: {
                        format: dateFormat,
                        date: "$timestamp",
                        timezone: "UTC",
                    },
                },
                count: { $sum: 1 }, // Count records
                totalSec: { $sum: "$seconds" }, // Sum seconds
            },
        });

        pipeline.push({
            // Project desired fields
            $project: {
                _id: 0,
                label: "$_id",
                count: 1,
                totalSec: 1,
            },
        });

        pipeline.push({ $sort: { label: 1 } }); // Sort by label ascending
        return pipeline;
    };

    private static fillMissingYearMonths = (
        year: string,
        dbResults: any[],
        isWater: boolean
    ) => {
        const resultMap = new Map(dbResults.map((r) => [r.label, r])); //Map results for quick lookup
        const filledData = [];
        const yearNumber = parseInt(year, 10);

        for (let month = 1; month <= 12; month++) {
            // Iterate through all months
            const monthString = month.toString().padStart(2, "0"); // Format month as "MM" 01, 02, ..., 12
            const label = `${yearNumber}-${monthString}`; // "YYYY-MM"
            const found = resultMap.get(label); // Check if data exists for this month

            if (found) {
                // If data exists, add it to filledData
                if (!isWater) delete found.totalSec; // Remove totalSec if not WATER
                filledData.push(found); // Add existing data point
            } else {
                // If no data, add a zeroed data point
                const dataPoint = { label, count: 0 }; // Create zeroed data point
                if (isWater) dataPoint["totalSec"] = 0; // Add totalSec if WATER
                filledData.push(dataPoint); // Add zeroed data point
            }
        }
        return filledData;
    };

    private static fillMissingMonthDays = (
        month: string,
        dbResults: any[],
        isWater: boolean
    ) => {
        const resultMap = new Map(dbResults.map((r) => [r.label, r])); //Map results for quick lookup
        const filledData = [];
        const [yearString, monthString] = month.split("-").map(Number); // Extract year and month numbers from "YYYY-MM"

        const daysInMonth = new Date(
            Date.UTC(yearString, monthString, 0)
        ).getUTCDate(); // Get number of days in the month

        for (let day = 1; day <= daysInMonth; day++) {
            // Iterate through all days
            const date = new Date(Date.UTC(yearString, monthString - 1, day)); // Create date object
            const dayOfWeek = date.getUTCDay(); // Get day of the week (0=Sunday, 6=Saturday)

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue; // Skip weekends
            }

            const dayString = day.toString().padStart(2, "0"); // Format day as "DD"
            const label = `${yearString}-${monthString
                .toString()
                .padStart(2, "0")}-${dayString}`; // "YYYY-MM-DD"

            const found = resultMap.get(label); // Check if data exists for this day
            if (found) {
                // If data exists, add it to filledDatas
                if (!isWater) delete found.totalSec; // Remove totalSec if not WATER
                filledData.push(found);
            } else {
                // If no data, add a zeroed data point
                const dataPoint = { label, count: 0 }; // Create zeroed data point
                if (isWater) dataPoint["totalSec"] = 0; // Add totalSec if WATER
                filledData.push(dataPoint);
            }
        }
        return filledData;
    };

    static getSuppliesRecordsByDayOrMonthOrYear = async (
        query: IQueryOptions
    ) => {
        const $matchStage = this.calculateDateRange(query);
        const pipeline = [
            $matchStage,
            {
                $group: {
                    _id: "$sensorType",
                    count: { $sum: 1 },
                    totalSec: { $sum: "$seconds" },
                },
            },
            {
                $project: {
                    _id: 0,
                    sensorType: "$_id",
                    count: 1,
                    totalSec: 1,
                },
            },
        ];

        const dbResults = await SensorRecord.aggregate(pipeline);
        const resultMap = new Map(
            dbResults.map((item) => [item.sensorType, item])
        );

        const finalSummary = [];

        for (const type of sensorTypeValues) {
            const found = resultMap.get(type);
            if (found) {
                if (found.sensorType !== SensorType.WATER) {
                    delete found.totalSec;
                }
                finalSummary.push(found);
            } else {
                const summary = {
                    sensorType: type,
                    count: 0,
                };
                if (type === SensorType.WATER) {
                    summary["totalSec"] = 0;
                }
                finalSummary.push(summary);
            }
        }
        finalSummary.sort((a, b) => a.sensorType - b.sensorType);
        return finalSummary;
    };

    private static calculateDateRange = (
        query: IQueryOptions
    ): { $match: any } => {
        const { day, month, year } = query;
        let startDate: Date;
        let endDate: Date;

        try {
            if (day) {
                const [yearString, monthString, dayString] = day
                    .split("-")
                    .map(Number);
                startDate = new Date(
                    Date.UTC(yearString, monthString - 1, dayString)
                );
                endDate = new Date(
                    Date.UTC(
                        yearString,
                        monthString - 1,
                        dayString,
                        23,
                        59,
                        59,
                        999
                    )
                );
            } else if (month) {
                const [yearString, monthString] = month.split("-").map(Number);
                startDate = new Date(Date.UTC(yearString, monthString - 1, 1));
                const lastDay = new Date(
                    Date.UTC(yearString, monthString, 0)
                ).getUTCDate();
                endDate = new Date(
                    Date.UTC(
                        yearString,
                        monthString - 1,
                        lastDay,
                        23,
                        59,
                        59,
                        999
                    )
                );
            } else if (year) {
                const yearNumber = parseInt(year, 10);
                startDate = new Date(Date.UTC(yearNumber, 0, 1));
                endDate = new Date(
                    Date.UTC(yearNumber, 11, 31, 23, 59, 59, 999)
                );
            } else {
                return { $match: {} };
            }
            return {
                $match: { timestamp: { $gte: startDate, $lte: endDate } },
            };
        } catch (error) {
            return { $match: { _id: new mongoose.Types.ObjectId() } };
        }
    };
}
