import { SensorTypeConfigService } from "../services/sensorTypeConfig.service";

export class AppError extends Error {
    constructor(public message: string, public status: number) {
        super(message);
    }
}

export class SensorTypeConfigHelper {
    static validateConfigExists = async (shouldExist: boolean) => {
        const config = await SensorTypeConfigService.getConfig();
        if (shouldExist && !config) {
            throw new AppError("Configuration does not exist", 404);
        }
        if (!shouldExist && config) {
            throw new AppError("Configuration already exists", 400);
        }
        return config;
    };
}
