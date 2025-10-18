import SensorTypeConfig, {
    SensorTypeConfigData,
} from "../models/sensorTypeConfig";

export class SensorTypeConfigService {
    static getConfig = async () => {
        return await SensorTypeConfig.findOne({});
    };

    static createConfig = async (data: SensorTypeConfigData) => {
        const newConfig = new SensorTypeConfig(data);
        return await newConfig.save();
    };

    static updateConfig = async (updates: SensorTypeConfigData) => {
        const updated = await SensorTypeConfig.findOneAndUpdate({}, updates, {
            new: true,
        });
        return updated;
    };

    static deleteConfig = async () => {
        return await SensorTypeConfig.findOneAndDelete({});
    };
}
