import ESP32Alert, {
    ESP32AlertData,
    ESPType,
    IESP32Alert,
} from "../models/esp32Alerts.model";

export class ESP32TypeService {
    static getAlerts = async (): Promise<IESP32Alert[]> => {
        return await ESP32Alert.getAlerts();
    };

    static updateAlert = async (
        espType: ESPType,
        data: ESP32AlertData["alertMessage"]
    ): Promise<IESP32Alert> => {
        const alert = await ESP32Alert.getAlert(espType);
        alert.alertMessage = data;
        return await alert.save();
    };
}
