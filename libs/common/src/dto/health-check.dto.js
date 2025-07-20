"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class HealthCheckDto {
    status;
    timestamp;
    service;
    version;
    environment;
    constructor(service, status = 'ok', version, environment) {
        this.status = status;
        this.timestamp = new Date().toISOString();
        this.service = service;
        this.version = version;
        this.environment = environment;
    }
}
exports.HealthCheckDto = HealthCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service health status',
        enum: ['ok', 'error', 'degraded'],
        example: 'ok'
    }),
    (0, class_validator_1.IsIn)(['ok', 'error', 'degraded']),
    __metadata("design:type", String)
], HealthCheckDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when health check was performed',
        example: '2024-01-01T00:00:00.000Z'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HealthCheckDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the service',
        example: 'teskilat'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HealthCheckDto.prototype, "service", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Version of the service',
        example: '1.0.0',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HealthCheckDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Environment the service is running in',
        example: 'development',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HealthCheckDto.prototype, "environment", void 0);
//# sourceMappingURL=health-check.dto.js.map