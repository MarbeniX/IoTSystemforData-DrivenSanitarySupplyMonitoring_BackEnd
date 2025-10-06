import mongoose, { Document, Schema } from "mongoose";

export interface IWaterLocationIdConfig extends Document {
    locationID: string;
    waterPressure: number;
}

const WaterLocationIdCofig: Schema = new Schema({
    locationID: {
        type: String,
        required: true,
        unique: true,
    },
    waterPressure: {
        type: Number,
        required: true,
    },
});

const WaterLocationIdConfig = mongoose.model<IWaterLocationIdConfig>(
    "WaterIdConfig",
    WaterLocationIdCofig
);
export default WaterLocationIdConfig;
