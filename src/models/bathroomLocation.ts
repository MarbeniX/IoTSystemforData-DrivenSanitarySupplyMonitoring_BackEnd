import mongoose, { Document, Schema } from "mongoose";

enum nameBuilding {
    ISC = "ISC",
    LCDIA = "LCD/IA",
    GOB = "GOB",
}

export interface IBathroomLocation extends Document {
    locationCode: string;
    waterPressure: number;
    building: number;
    floor: number;
    zone?: number;
    gender: string;
    nameBuilding?: string;
}

const BathroomLocationSchema: Schema = new Schema({
    locationCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    waterPressure: {
        type: Number,
        required: true,
    },
    building: {
        type: Number,
        required: true,
    },
    floor: {
        type: Number,
        required: true,
    },
    zone: {
        type: Number,
        required: false,
    },
    gender: {
        type: String,
        required: true,
        enum: ["M", "F"],
    },
    nameBuilding: {
        type: String,
        enum: Object.values(nameBuilding),
        required: false,
    },
});

const BathroomLocation = mongoose.model<IBathroomLocation>(
    "BathroomLocation",
    BathroomLocationSchema
);
export default BathroomLocation;
