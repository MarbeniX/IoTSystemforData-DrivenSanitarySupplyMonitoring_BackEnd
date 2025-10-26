import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISensorTypeConfig extends Document {
    soapCapacity: number;
    soapDispensePerUse: number;
    tankFlushCapacity: number;
    totalTowelLength: number;
    towelLengthPerUse: number;
    watterPressure: number;
    singleton: boolean;
}

export interface ISensorTypeConfigModel extends Model<ISensorTypeConfig> {
    getConfig(): Promise<ISensorTypeConfig>;
}

export type SensorTypeConfigData = Omit<ISensorTypeConfig, keyof Document>;

const SensorTypeConfigSchema: Schema = new Schema({
    soapCapacity: {
        type: Number,
        default: 0,
    },
    soapDispensePerUse: {
        type: Number,
        default: 0,
    },
    tankFlushCapacity: {
        type: Number,
        default: 0,
    },
    totalTowelLength: {
        type: Number,
        default: 0,
    },
    towelLengthPerUse: {
        type: Number,
        default: 0,
    },
    watterPressure: {
        type: Number,
        default: 0,
    },
    singleton: {
        type: Boolean,
        default: true,
        unique: true,
        required: true,
    },
});

SensorTypeConfigSchema.statics.getConfig =
    async function (): Promise<ISensorTypeConfig> {
        const config = await this.findOne({ singleton: true });
        if (config) {
            return config;
        }
        return await this.create({});
    };

const SensorTypeConfig = mongoose.model<
    ISensorTypeConfig,
    ISensorTypeConfigModel
>("SensorTypeConfig", SensorTypeConfigSchema);

export default SensorTypeConfig;
