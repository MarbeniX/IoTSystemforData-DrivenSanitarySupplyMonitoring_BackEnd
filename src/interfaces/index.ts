export enum SensorType {
    PAPER = 0,
    TANK = 1,
    SOAP = 2,
    WATER = 3,
    TOWEL = 4,
}

export enum ESPType {
    PAPER = SensorType.PAPER,
    TANK = SensorType.TANK,
    SOAP = SensorType.SOAP,
    WATER = SensorType.WATER,
    TOWEL = SensorType.TOWEL,
    MASTER = 5,
}

export interface IHistoricRecordSummary {
    sensorType: SensorType;
    totalRecords: number;
    totalSeconds?: number;
}

export const sensorTypeValues = Object.values(SensorType).filter(
    (value) => typeof value === "number"
) as number[];

export type SensorTypeValues = (typeof sensorTypeValues)[number];
