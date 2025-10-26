import mongoose, { Document, Model, Schema } from "mongoose";

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
    sensorType: SensorType;
    timestamp: Date;
    waterActiveTime?: number;
    revolutions?: number;
}

export type SensorRecordData = Omit<ISensorRecord, keyof Document>;

const SensorRecordSchema: Schema = new Schema({
    sensorType: {
        type: Number,
        enum: sensorTypeValues,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
    waterActiveTime: {
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
