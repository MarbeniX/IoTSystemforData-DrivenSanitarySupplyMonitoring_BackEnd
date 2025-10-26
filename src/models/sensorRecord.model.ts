import mongoose, { Document, Schema } from "mongoose";

export enum SensorType {
    PAPER = 0,
    TANK = 1,
    SOAP = 2,
    WATER = 3,
    TOWEL = 4,
}

const sensorTypeValues = Object.values(SensorType).filter(
    (value) => typeof value === "number"
) as number[];

export interface ISensorRecord extends Document {
    id: SensorType;
    timestamp: Date;
    seconds?: number;
    revolutions?: number;
}

export type SensorRecordData = Omit<ISensorRecord, keyof Document>;

const SensorRecordSchema: Schema = new Schema({
    id: {
        type: Number,
        enum: sensorTypeValues,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
    seconds: {
        type: Number,
    },
    revolutions: {
        type: Number,
    },
});

const SensorRecord = mongoose.model<ISensorRecord>(
    "SensorRecord",
    SensorRecordSchema
);
export default SensorRecord;
