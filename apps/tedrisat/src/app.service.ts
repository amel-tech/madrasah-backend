import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from '@madrasah/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Tedrisat Hizmetinden Selamun Aleyküm!';
  }

  getHealth(): HealthCheckDto {
    return new HealthCheckDto('tedrisat', 'ok', '1.0.0', 'development');
  }
}
