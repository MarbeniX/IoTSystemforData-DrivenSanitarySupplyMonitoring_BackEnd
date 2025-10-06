import mongoose, { Document, Schema } from "mongoose";

enum SensorType {
    PAPER = "PAPER",
    TANK = "TANK",
    SOAP = "SOAP",
    WATER = "WATER",
    TOWEL = "TOWEL",
}

export interface ISensorRecord extends Document {
    sensorType: SensorType;
    locationID: string;
    timestamp: Date;
    waterActiveTime?: number;
    revolutions?: number;
}

const SensorRecordSchema: Schema = new Schema({
    sensorType: {
        type: String,
        enum: Object.values(SensorType),
        required: true,
    },
    locationID: {
        type: String,
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
