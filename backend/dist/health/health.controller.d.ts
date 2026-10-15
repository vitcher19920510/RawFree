import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    checkHealth(): Promise<import("./health.service").HealthCheckResult>;
}
