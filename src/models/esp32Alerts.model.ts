import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ESPType, SensorType } from "../interfaces";

export enum AlertMessage {
    ACTIVE = 0,
    INACTIVE = 1,
}

export const espTypeValues = Object.values(ESPType).filter(
    (value) => typeof value === "number"
) as number[];

export const alertMessageValues = Object.values(AlertMessage).filter(
    (value) => typeof value === "number"
) as number[];

export interface IESP32Alert extends Document {
    espType: ESPType;
    alertMessage: AlertMessage;
}

export interface IESP32AlertModel extends Model<IESP32Alert> {
    getAlert(espType: ESPType): Promise<IESP32Alert>;
    getAlerts(): Promise<IESP32Alert[]>;
}

export type ESP32AlertData = Omit<IESP32Alert, keyof Document>;

const ESP32AlertSchema: Schema<IESP32Alert, IESP32AlertModel> = new Schema(
    {
        espType: {
            type: Number,
            enum: espTypeValues,
            required: true,
            unique: true,
        },
        alertMessage: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

ESP32AlertSchema.statics.getAlert = async function (
    espType: ESPType
): Promise<IESP32Alert> {
    const alert = await this.findOne({ espType: espType });
    if (alert) {
        return alert;
    }
    return await this.create({ espType: espType });
};

ESP32AlertSchema.statics.getAlerts = async function (): Promise<IESP32Alert[]> {
    const promises = await espTypeValues.map((type) => this.getAlert(type));
    return Promise.all(promises);
};

const ESP32Alert = mongoose.model<IESP32Alert, IESP32AlertModel>(
    "ESP32Alert",
    ESP32AlertSchema
);
export default ESP32Alert;
