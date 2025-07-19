import { Injectable } from '@nestjs/common';
import { HealthCheckDto } from '@madrasah/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Teşkilat Hizmetinden Selamun Aleyküm!';
  }

  getHealth(): HealthCheckDto {
    return new HealthCheckDto('teskilat', 'ok', '1.0.0', 'development');
  }
}
