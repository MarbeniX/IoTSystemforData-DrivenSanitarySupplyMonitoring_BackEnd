import mongoose, { Document, Schema, Types } from "mongoose";

enum SensorType {
    PAPER = "PAPER",
    TANK = "TANK",
    SOAP = "SOAP",
    WATER = "WATER",
    TOWEL = "TOWEL",
}

export interface ISensorRecord extends Document {
    sensorType: SensorType;
    timestamp: Date;
    waterActiveTime?: number;
    revolutions?: number;
    // locationID: string;
    // bathroomLocationID: Types.ObjectId;
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
    // bathroomLocationID: {
    //     type: Types.ObjectId,
    //     ref: "BathroomLocation",
    //     required: true,
    // },
});

const SensorRecord = mongoose.model<ISensorRecord>(
    "SensorRecord",
    SensorRecordSchema
);
export default SensorRecord;
