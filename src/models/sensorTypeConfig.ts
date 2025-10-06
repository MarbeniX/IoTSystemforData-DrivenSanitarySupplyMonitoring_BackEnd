import mongoose, { Document, Schema } from "mongoose";

enum SensorType {
    SOAP = "SOAP",
    TANK = "TANK",
    TOWEL = "TOWEL",
}

export interface ISensorTypeConfig extends Document {
    sensorType: SensorType;
    soapCapacity?: number;
    soapDispensePerUse?: number;
    tankFlushCapacity?: number;
    totalTowelLength?: number;
    towelLengthPerUse?: number;
}

const SensorTypeConfigSchema: Schema = new Schema({
    sensorType: {
        type: String,
        enum: Object.values(SensorType),
        required: true,
        unique: true,
    },
    soapCapacity: {
        type: Number,
    },
    soapDispensePerUse: {
        type: Number,
    },
    tankFlushCapacity: {
        type: Number,
    },
    totalTowelLength: {
        type: Number,
    },
    towelLengthPerUse: {
        type: Number,
    },
});

const SensorTypeConfig = mongoose.model<ISensorTypeConfig>(
    "SensorTypeConfig",
    SensorTypeConfigSchema
);
export default SensorTypeConfig;
