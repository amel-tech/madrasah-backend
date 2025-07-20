export declare class HealthCheckDto {
    status: 'ok' | 'error' | 'degraded';
    timestamp: string;
    service: string;
    version?: string;
    environment?: string;
    constructor(service: string, status?: 'ok' | 'error' | 'degraded', version?: string, environment?: string);
}
