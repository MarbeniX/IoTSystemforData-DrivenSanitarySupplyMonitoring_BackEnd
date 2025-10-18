import mongoose, { Document, Schema } from "mongoose";

export interface ISensorTypeConfig extends Document {
    soapCapacity: number;
    soapDispensePerUse: number;
    tankFlushCapacity: number;
    totalTowelLength: number;
    towelLengthPerUse: number;
}
export type SensorTypeConfigData = Omit<ISensorTypeConfig, keyof Document>;

const SensorTypeConfigSchema: Schema = new Schema({
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
