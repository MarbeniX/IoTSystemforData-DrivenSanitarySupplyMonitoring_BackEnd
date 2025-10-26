import { Request, Response } from "express";
import { SensorTypeConfigData } from "../models/sensorTypeConfig.model";
import { SensorTypeConfigService } from "../services/sensorTypeConfig.service";

export class SensorTypeConfigController {
    static getConfig = async (res: Response) => {
        try {
            const config = await SensorTypeConfigService.getConfig();
            res.status(200).json({
                message: "Sensor type configuration retrieved",
                data: config,
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    };

    static updateConfig = async (req: Request, res: Response) => {
        try {
            const updatedConfig = await SensorTypeConfigService.updateConfig(
                req.body as Partial<SensorTypeConfigData>
            );
            res.status(200).json({
                message: "Sensor type configuration updated",
                data: updatedConfig,
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    };
}
