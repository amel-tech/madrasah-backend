import { Injectable, Inject } from '@nestjs/common';
import { HealthCheckDto, LOGGER, ILogger } from '@madrasah/common';

@Injectable()
export class AppService {
  constructor(@Inject(LOGGER) private readonly logger: ILogger) {
    this.logger.setContext(AppService.name);
  }

  getHello(): string {
    this.logger.log('getHello called');
    return 'Tedrisat Hizmetinden Selamun Aleyküm! sadffasdfdfsdfssadfdf';
  }

  getHealth(): HealthCheckDto {
    this.logger.log('Health check requested');
    return new HealthCheckDto('tedrisat', 'ok', '1.0.0', 'development');
  }
}
