import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseService } from '../../src/database/database.service';
import { createTestApp, TEST_USER_ID } from '../helpers/test-app.helper';
import { TestDatabaseUtils } from '../helpers/test-database.helper';

const MISSING_UUID = '00000000-0000-0000-0000-000000000000';

describe('KoskController (e2e)', () => {
  let app: INestApplication;
  let dbUtils: TestDatabaseUtils;

  beforeAll(async () => {
    app = await createTestApp({ authUserId: TEST_USER_ID });
    dbUtils = new TestDatabaseUtils(app.get<DatabaseService>(DatabaseService));
  });

  beforeEach(async () => {
    // Deleting köşks cascades to courses → weeks/lessons/müderris/resources/enrollments.
    await dbUtils.cleanTables('kosks');
  });

  afterAll(async () => {
    await dbUtils.cleanTables('kosks');
    await app.close();
  });

  const createKosk = (overrides: Record<string, unknown> = {}) =>
    request(app.getHttpServer())
      .post('/kosks')
      .send({ name: 'Süleymaniye Köşkü', handle: '@suleymaniye', ...overrides });

  describe('/kosks (POST)', () => {
    it('creates a köşk owned by the authenticated user', () => {
      return createKosk({ description: 'Klasik medrese.', coverHue: 215 })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Süleymaniye Köşkü');
          expect(res.body).toHaveProperty('ownerId', TEST_USER_ID);
          expect(res.body).toHaveProperty('coverHue', 215);
          expect(res.body).toHaveProperty('isPrivate', true);
        });
    });

    it('rejects an empty name', () => {
      return createKosk({ name: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body.context.errors[0]).toHaveProperty('property', 'name');
        });
    });

    it('rejects an out-of-range coverHue', () => {
      return createKosk({ coverHue: 999 })
        .expect(400)
        .expect((res) => {
          expect(res.body.context.errors[0]).toHaveProperty(
            'property',
            'coverHue',
          );
        });
    });
  });

  describe('/kosks (GET)', () => {
    it('returns an empty array when none exist', () => {
      return request(app.getHttpServer())
        .get('/kosks')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(0);
        });
    });

    it('returns köşks with a courseCount', async () => {
      await createKosk().expect(201);
      return request(app.getHttpServer())
        .get('/kosks')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('courseCount', 0);
        });
    });
  });

  describe('/kosks/:id (GET)', () => {
    it('returns 404 for a missing köşk', () => {
      return request(app.getHttpServer())
        .get(`/kosks/${MISSING_UUID}`)
        .expect(404);
    });

    it('returns 400 for a malformed id', () => {
      return request(app.getHttpServer()).get('/kosks/not-a-uuid').expect(400);
    });

    it('returns the köşk when it exists', async () => {
      const created = await createKosk().expect(201);
      return request(app.getHttpServer())
        .get(`/kosks/${created.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', created.body.id);
          expect(res.body).toHaveProperty('courseCount', 0);
        });
    });
  });

  describe('/kosks/:id (PATCH/DELETE)', () => {
    it('updates a köşk', async () => {
      const created = await createKosk().expect(201);
      return request(app.getHttpServer())
        .patch(`/kosks/${created.body.id}`)
        .send({ name: 'Fatih Köşkü' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Fatih Köşkü');
        });
    });

    it('deletes a köşk', async () => {
      const created = await createKosk().expect(201);
      await request(app.getHttpServer())
        .delete(`/kosks/${created.body.id}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/kosks/${created.body.id}`)
        .expect(404);
    });
  });
});
