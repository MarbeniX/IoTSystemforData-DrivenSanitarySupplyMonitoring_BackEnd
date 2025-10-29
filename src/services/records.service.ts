import csvParser from "csv-parser";
import { Readable } from "stream"; // Para convertir el Buffer en un Stream
import SensorRecord, {
    ISensorRecord,
    SensorRecordData,
} from "../models/sensorRecord.model";
import {
    IHistoricRecordSummary,
    SensorTypeValues,
    sensorTypeValues,
} from "../interfaces";

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

    static getHistoricUsageSummary = async (): Promise<
        IHistoricRecordSummary[]
    > => {
        const pipeline = [
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
            {
                $sort: { sensorType: 1 },
            },
        ];
        const summary = await SensorRecord.aggregate(pipeline as any[]);
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

        const summary = await SensorRecord.aggregate(pipeline as any[]);
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

    static getLatestRecords = async (): Promise<ISensorRecord[]> => {
        const records = await SensorRecord.find({})
            .sort({ timestamp: -1 })
            .limit(10);
        return records;
    };
}
