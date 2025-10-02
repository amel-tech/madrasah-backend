import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { AuthGuardModule, LoggerModule } from '@madrasah/common';
import { ConfigModule } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [() => ({
            keycloak: {
              jwksUrl: 'test-url'
            },
          })],
          isGlobal: true,
        }),
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
