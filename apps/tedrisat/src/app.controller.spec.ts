import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuardModule, LoggerModule } from '@madrasah/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    process.env.KEYCLOAK_JWKS_URL="test-url"
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        AuthGuardModule
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe(
        'Tedrisat Hizmetinden Selamun Aleyküm!',
      );
    });
  });
});
