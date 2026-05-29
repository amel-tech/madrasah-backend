import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseService } from '../../src/database/database.service';
import { createTestApp, TEST_USER_ID } from '../helpers/test-app.helper';
import { TestDatabaseUtils } from '../helpers/test-database.helper';

const MISSING_UUID = '00000000-0000-0000-0000-000000000000';

const coursePayload = () => ({
  title: 'Bina ve İzhar Şerhi',
  subtitle: 'Klasik sarf metni',
  category: 'Sarf',
  level: 'INTERMEDIATE',
  language: 'Türkçe / Arapça',
  coverHue: 145,
  durationWeeks: 10,
  status: 'PUBLISHED',
  grantsCertificate: true,
  muderris: [{ name: 'Müderris Ahmed Hilmi', title: 'Sarf Müderrisi', avatarHue: 145 }],
  resources: [{ name: 'Bina ve İzhar', meta: 'PDF · 124 sayfa', type: 'pdf' }],
  weeks: [
    {
      weekNumber: 2,
      title: 'İkinci Bab',
      lessons: [{ title: 'Ölçme', type: 'QUIZ', duration: '10 soru' }],
    },
    {
      weekNumber: 1,
      title: 'Birinci Bab',
      summary: 'Müfredat tanıtımı',
      lessons: [
        { title: 'Açılış', type: 'VIDEO', duration: '12 dk', isPreview: true },
        { title: 'Şerh', type: 'VIDEO', duration: '28 dk', kaynak: 'Bina · s. 4-9' },
      ],
    },
  ],
});

describe('CourseController (e2e)', () => {
  let app: INestApplication;
  let dbUtils: TestDatabaseUtils;
  let koskId: string;

  beforeAll(async () => {
    app = await createTestApp({ authUserId: TEST_USER_ID });
    dbUtils = new TestDatabaseUtils(app.get<DatabaseService>(DatabaseService));
  });

  beforeEach(async () => {
    // Deleting köşks cascades to courses → weeks/lessons/müderris/resources/enrollments.
    await dbUtils.cleanTables('kosks');
    const kosk = await request(app.getHttpServer())
      .post('/kosks')
      .send({ name: 'Süleymaniye Köşkü' })
      .expect(201);
    koskId = kosk.body.id;
  });

  afterAll(async () => {
    await dbUtils.cleanTables('kosks');
    await app.close();
  });

  const createCourse = () =>
    request(app.getHttpServer())
      .post(`/kosks/${koskId}/courses`)
      .send(coursePayload());

  describe('POST /kosks/:koskId/courses', () => {
    it('creates a course with its nested weeks, lessons, müderris and resources', () => {
      return createCourse()
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('koskId', koskId);
          expect(res.body).toHaveProperty('authorId', TEST_USER_ID);
          expect(res.body.muderris).toHaveLength(1);
          expect(res.body.resources).toHaveLength(1);
          expect(res.body.weeks).toHaveLength(2);
          // weeks come back ordered by weekNumber
          expect(res.body.weeks[0]).toHaveProperty('weekNumber', 1);
          expect(res.body.weeks[1]).toHaveProperty('weekNumber', 2);
          expect(res.body.weeks[0].lessons).toHaveLength(2);
          expect(res.body.weeks[0].lessons[0]).toHaveProperty('isPreview', true);
          expect(res.body).toHaveProperty('enrollment', null);
        });
    });

    it('returns 404 when the köşk does not exist', () => {
      return request(app.getHttpServer())
        .post(`/kosks/${MISSING_UUID}/courses`)
        .send(coursePayload())
        .expect(404);
    });

    it('rejects an invalid lesson type', () => {
      const payload = coursePayload();
      payload.weeks[0].lessons[0].type = 'BOGUS';
      return request(app.getHttpServer())
        .post(`/kosks/${koskId}/courses`)
        .send(payload)
        .expect(400);
    });

    it('rejects a missing title', () => {
      const payload: Record<string, unknown> = coursePayload();
      delete payload.title;
      return request(app.getHttpServer())
        .post(`/kosks/${koskId}/courses`)
        .send(payload)
        .expect(400);
    });
  });

  describe('GET /kosks/:koskId/courses', () => {
    it('returns course summaries with aggregate counts', async () => {
      await createCourse().expect(201);
      return request(app.getHttpServer())
        .get(`/kosks/${koskId}/courses`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          const c = res.body[0];
          expect(c).toHaveProperty('weekCount', 2);
          expect(c).toHaveProperty('lessonCount', 3);
          expect(c).toHaveProperty('resourceCount', 1);
          expect(c.muderris).toHaveLength(1);
          expect(c).toHaveProperty('enrollment', null);
        });
    });
  });

  describe('GET /courses/:id', () => {
    it('returns 404 for a missing course', () => {
      return request(app.getHttpServer())
        .get(`/courses/${MISSING_UUID}`)
        .expect(404);
    });

    it('returns the full detail with ordered lessons', async () => {
      const created = await createCourse().expect(201);
      return request(app.getHttpServer())
        .get(`/courses/${created.body.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.weeks[0].lessons[0]).toHaveProperty('title', 'Açılış');
          expect(res.body.weeks[0].lessons[1]).toHaveProperty('title', 'Şerh');
        });
    });
  });

  describe('enrollment + progress', () => {
    it('enrolls the talebe and tracks progress, completing at 100%', async () => {
      const created = await createCourse().expect(201);
      const id = created.body.id;

      await request(app.getHttpServer())
        .post(`/courses/${id}/enroll`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId', TEST_USER_ID);
          expect(res.body).toHaveProperty('progress', 0);
          expect(res.body).toHaveProperty('status', 'ENROLLED');
        });

      await request(app.getHttpServer())
        .put(`/courses/${id}/progress`)
        .send({ progress: 35 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('progress', 35);
          expect(res.body).toHaveProperty('status', 'ENROLLED');
        });

      await request(app.getHttpServer())
        .put(`/courses/${id}/progress`)
        .send({ progress: 100 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'COMPLETED');
        });

      // detail reflects the current user's enrollment
      return request(app.getHttpServer())
        .get(`/courses/${id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.enrollment).toHaveProperty('progress', 100);
          expect(res.body.enrollment).toHaveProperty('status', 'COMPLETED');
        });
    });

    it('rejects out-of-range progress', async () => {
      const created = await createCourse().expect(201);
      return request(app.getHttpServer())
        .put(`/courses/${created.body.id}/progress`)
        .send({ progress: 150 })
        .expect(400);
    });
  });

  describe('PATCH/DELETE /courses/:id', () => {
    it('updates course-level fields', async () => {
      const created = await createCourse().expect(201);
      return request(app.getHttpServer())
        .patch(`/courses/${created.body.id}`)
        .send({ title: 'Yeni Başlık', status: 'DRAFT' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Yeni Başlık');
          expect(res.body).toHaveProperty('status', 'DRAFT');
          // nested data is preserved
          expect(res.body.weeks).toHaveLength(2);
        });
    });

    it('replaces a course including its curriculum', async () => {
      const created = await createCourse().expect(201)
      const id = created.body.id

      const payload = coursePayload()
      payload.title = 'Güncellenmiş Kurs'
      payload.status = 'PUBLISHED'
      payload.muderris = []
      payload.resources = []
      payload.weeks = [
        {
          weekNumber: 1,
          title: 'Tek Hafta',
          lessons: [{ title: 'Yeni Ders', type: 'VIDEO', duration: '20 dk' }],
        },
      ]

      return request(app.getHttpServer())
        .put(`/courses/${id}`)
        .send(payload)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Güncellenmiş Kurs')
          expect(res.body).toHaveProperty('status', 'PUBLISHED')
          // curriculum fully replaced (was 2 weeks / 1 müderris / 1 resource)
          expect(res.body.weeks).toHaveLength(1)
          expect(res.body.weeks[0].lessons).toHaveLength(1)
          expect(res.body.muderris).toHaveLength(0)
          expect(res.body.resources).toHaveLength(0)
        })
    })

    it('returns 404 when replacing a missing course', () => {
      return request(app.getHttpServer())
        .put(`/courses/${MISSING_UUID}`)
        .send(coursePayload())
        .expect(404)
    })

    it('deletes a course', async () => {
      const created = await createCourse().expect(201);
      await request(app.getHttpServer())
        .delete(`/courses/${created.body.id}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/courses/${created.body.id}`)
        .expect(404);
    });
  });
});
