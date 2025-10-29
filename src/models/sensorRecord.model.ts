import mongoose, { Document, Schema } from "mongoose";
import { SensorType, sensorTypeValues } from "../interfaces";

export interface ISensorRecord extends Document {
    sensorType: SensorType;
    timestamp: Date;
    seconds?: number;
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
