import { Injectable, Inject } from '@nestjs/common';
import {
  HealthCheckDto,
  LOGGER,
  ILogger,
  NotFoundException,
  BusinessException,
} from '@madrasah/common';
import BusinessExceptionKey from './constants/exception_keys/business';
import NotFoundExceptionKey from './constants/exception_keys/not_found';

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
    return new HealthCheckDto('tedrisat', 'ok', '1.0.0', 'development');
  }

  notFoundErrorSample(): string {
    throw new NotFoundException(NotFoundExceptionKey.notFound);
  }

  businessExceptionSample(): string {
    throw new BusinessException(BusinessExceptionKey.business);
  }
}
