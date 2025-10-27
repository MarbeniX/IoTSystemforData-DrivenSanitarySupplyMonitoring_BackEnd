import csvParser from "csv-parser";
import { Readable } from "stream"; // Para convertir el Buffer en un Stream
import SensorRecord, {
    ISensorRecord,
    SensorRecordData,
} from "../models/sensorRecord.model";

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
                        id: sensorType,
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
            .filter((record) => record !== null); // Filtramos filas nulas o inválidas

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
}
