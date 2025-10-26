import SensorTypeConfig, {
    ISensorTypeConfig,
    SensorTypeConfigData,
} from "../models/sensorTypeConfig.model";

export class SensorTypeConfigService {
    static getConfig = async (): Promise<ISensorTypeConfig> => {
        return await SensorTypeConfig.getConfig();
    };
    static updateConfig = async (data: Partial<SensorTypeConfigData>) => {
        const config = await SensorTypeConfig.getConfig();
        Object.assign(config, data);
        return await config.save();
    };
}
