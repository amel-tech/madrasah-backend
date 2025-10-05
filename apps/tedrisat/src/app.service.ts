import { Injectable, Inject } from '@nestjs/common';
import { HealthCheckDto, LOGGER, ILogger } from '@madrasah/common';
import { configuration } from './config';
const { version } = configuration();

@Injectable()
export class AppService {
  constructor(@Inject(LOGGER) private readonly logger: ILogger) {
    this.logger.setContext(AppService.name);
  }

  getHello(): string {
    this.logger.log('getHello called');
    return 'Tedrisat Hizmetinden Selamun Aleyküm!';
  }

  getHealth(): HealthCheckDto {
    this.logger.log('Health check requested');
    return new HealthCheckDto('tedrisat', 'ok', version, 'development');
  }
}
