import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseService } from '../../src/database/database.service';
import { kosks } from '../../src/database/schema/kosk.schema';
import { createTestApp, TEST_USER_ID } from '../helpers/test-app.helper';
import { TestDatabaseUtils } from '../helpers/test-database.helper';

const MISSING_UUID = '00000000-0000-0000-0000-000000000000';
const OTHER_USER_ID = '11111111-1111-1111-1111-111111111111';

describe('KoskController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let dbUtils: TestDatabaseUtils;

  beforeAll(async () => {
    app = await createTestApp({ authUserId: TEST_USER_ID });
    databaseService = app.get<DatabaseService>(DatabaseService);
    dbUtils = new TestDatabaseUtils(databaseService);
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
          // discovery defaults + derived stats
          expect(res.body).toHaveProperty('tags', []);
          expect(res.body).toHaveProperty('verified', false);
          expect(res.body).toHaveProperty('rating', 0);
          expect(res.body).toHaveProperty('studentCount', 0);
          expect(res.body).toHaveProperty('muderrisCount', 0);
          expect(res.body).toHaveProperty('followerCount', 0);
          expect(res.body).toHaveProperty('isFollowing', false);
        });
    });

    it('persists owner-settable discovery fields', () => {
      return createKosk({
        field: 'Tefsir & Hadis',
        level: 'ADVANCED',
        tags: ['Tefsir', 'Hadis'],
      })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('field', 'Tefsir & Hadis')
          expect(res.body).toHaveProperty('level', 'ADVANCED')
          expect(res.body).toHaveProperty('tags', ['Tefsir', 'Hadis'])
        })
    })

    it('rejects client-set verified/featured/rating (not whitelisted)', () => {
      return createKosk({ verified: true, featured: true, rating: 5 })
        .expect(400)
    })

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

  describe('/kosks (GET, paginated)', () => {
    it('returns an empty page when none exist', () => {
      return request(app.getHttpServer())
        .get('/kosks')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items).toHaveLength(0);
          expect(res.body).toHaveProperty('total', 0);
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 12);
        });
    });

    it('returns köşks with stats and pagination meta', async () => {
      await createKosk().expect(201);
      return request(app.getHttpServer())
        .get('/kosks')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body).toHaveProperty('total', 1);
          expect(res.body.items[0]).toHaveProperty('courseCount', 0);
        });
    });

    it('honours page/limit', async () => {
      await createKosk().expect(201);
      await createKosk().expect(201);
      await createKosk().expect(201);
      return request(app.getHttpServer())
        .get('/kosks?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body).toHaveProperty('total', 3);
          expect(res.body).toHaveProperty('limit', 2);
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

    it('forbids a non-owner from editing or deleting a köşk', async () => {
      // a köşk owned by a different user
      const [other] = await databaseService.db
        .insert(kosks)
        .values({ ownerId: OTHER_USER_ID, name: 'Başka Köşk' })
        .returning();

      await request(app.getHttpServer())
        .patch(`/kosks/${other.id}`)
        .send({ name: 'Ele geçirildi' })
        .expect(403);
      await request(app.getHttpServer())
        .delete(`/kosks/${other.id}`)
        .expect(403);
    });
  });

  describe('/kosks/:id/follow', () => {
    it('follows and unfollows a köşk, reflected in isFollowing/followerCount', async () => {
      const created = await createKosk().expect(201);
      const id = created.body.id;

      await request(app.getHttpServer()).post(`/kosks/${id}/follow`).expect(201);

      await request(app.getHttpServer())
        .get(`/kosks/${id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('isFollowing', true);
          expect(res.body).toHaveProperty('followerCount', 1);
        });

      // idempotent: following again does not duplicate
      await request(app.getHttpServer()).post(`/kosks/${id}/follow`).expect(201);
      await request(app.getHttpServer())
        .get(`/kosks/${id}`)
        .expect(200)
        .expect((res) => expect(res.body).toHaveProperty('followerCount', 1));

      await request(app.getHttpServer()).delete(`/kosks/${id}/follow`).expect(200);
      return request(app.getHttpServer())
        .get(`/kosks/${id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('isFollowing', false);
          expect(res.body).toHaveProperty('followerCount', 0);
        });
    });

    it('returns 404 when following a missing köşk', () => {
      return request(app.getHttpServer())
        .post(`/kosks/${MISSING_UUID}/follow`)
        .expect(404);
    });
  });
});
