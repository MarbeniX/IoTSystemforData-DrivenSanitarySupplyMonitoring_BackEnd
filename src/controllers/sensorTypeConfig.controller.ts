import { Request, Response } from "express";
import { SensorTypeConfigData } from "../models/sensorTypeConfig";
import { SensorTypeConfigService } from "../services/sensorTypeConfig.service";
import { SensorTypeConfigHelper } from "../helpers/sensorTypeCofnig.helper";

export class SensorTypeConfigController {
    static createConfig = async (req: Request, res: Response) => {
        try {
            await SensorTypeConfigHelper.validateConfigExists(false);
            const newConfig = await SensorTypeConfigService.createConfig(
                req.body as SensorTypeConfigData
            );

            res.status(201).json({
                message: "Sensor type configuration created",
                data: newConfig,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    static getConfig = async (req: Request, res: Response) => {
        try {
            const config = await SensorTypeConfigHelper.validateConfigExists(
                true
            );
            res.status(200).json({
                message: "Sensor type configuration retrieved",
                data: config,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    static updateConfig = async (req: Request, res: Response) => {
        try {
            await SensorTypeConfigHelper.validateConfigExists(true);
            const updates = req.body as SensorTypeConfigData;
            const updatedConfig = await SensorTypeConfigService.updateConfig(
                updates
            );
            res.status(200).json({
                message: "Sensor type configuration updated",
                data: updatedConfig,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };

    static deleteConfig = async (req: Request, res: Response) => {
        try {
            await SensorTypeConfigHelper.validateConfigExists(true);
            await SensorTypeConfigService.deleteConfig();
            res.status(200).json({
                message: "Sensor type configuration deleted",
            });
        } catch (error: any) {
            res.status(error.status || 500).json({ message: error.message });
        }
    };
}
