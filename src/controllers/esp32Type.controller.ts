import { Response, Request } from "express";
import { ESP32TypeService } from "../services/esp32Type.service";
import { ESP32AlertData } from "../models/esp32Alerts.model";

export class ESP32TypeController {
    static getAlerts = async (req: Request, res: Response) => {
        try {
            const alerts = await ESP32TypeService.getAlerts();
            res.status(200).json({
                message: "Alerts retrieved successfully",
                data: alerts,
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    };

    static updateAlert = async (req: Request, res: Response) => {
        try {
            const { espType, alertMessage } = req.body as ESP32AlertData;
            const updateAlert = await ESP32TypeService.updateAlert(
                espType,
                alertMessage
            );
            res.status(200).json({
                message: "Alert updated successfully",
                data: updateAlert,
            });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    };
}
