import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseService } from '../../src/database/database.service';
import { kosks } from '../../src/database/schema/kosk.schema';
import { courses } from '../../src/database/schema/course.schema';
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

const OTHER_USER_ID = '11111111-1111-1111-1111-111111111111';

describe('CourseController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let dbUtils: TestDatabaseUtils;
  let koskId: string;

  beforeAll(async () => {
    app = await createTestApp({ authUserId: TEST_USER_ID });
    databaseService = app.get<DatabaseService>(DatabaseService);
    dbUtils = new TestDatabaseUtils(databaseService);
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

  describe('GET /courses/enrolled', () => {
    it('returns the talebe enrolled courses with köşk name and progress', async () => {
      const created = await createCourse().expect(201);
      const id = created.body.id;

      await request(app.getHttpServer())
        .put(`/courses/${id}/progress`)
        .send({ progress: 35 })
        .expect(200);

      return request(app.getHttpServer())
        .get('/courses/enrolled')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          const c = res.body[0];
          expect(c).toHaveProperty('id', id);
          expect(c).toHaveProperty('koskName', 'Süleymaniye Köşkü');
          expect(c).toHaveProperty('weekCount', 2);
          expect(c).toHaveProperty('lessonCount', 3);
          expect(c.muderris).toHaveLength(1);
          expect(c.enrollment).toHaveProperty('progress', 35);
          expect(c.enrollment).toHaveProperty('status', 'ENROLLED');
        });
    });

    it('returns an empty list when the talebe is not enrolled in anything', async () => {
      await createCourse().expect(201);
      return request(app.getHttpServer())
        .get('/courses/enrolled')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
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

    it('preserves ids of retained weeks and lessons on replace', async () => {
      const created = await createCourse().expect(201)
      const id = created.body.id
      const detail = (
        await request(app.getHttpServer()).get(`/courses/${id}`).expect(200)
      ).body
      const week1 = detail.weeks[0]
      const lesson1 = week1.lessons[0]

      const payload = {
        title: detail.title,
        weeks: [
          {
            id: week1.id,
            weekNumber: 1,
            title: 'Birinci Bab (düzenlendi)',
            lessons: [
              { id: lesson1.id, title: 'Açılış (düzenlendi)', type: lesson1.type },
              { title: 'Yeni eklenen ders', type: 'VIDEO' },
            ],
          },
        ],
        muderris: detail.muderris.map((m: { id: string, name: string }) => ({
          id: m.id,
          name: m.name,
        })),
        resources: detail.resources.map((r: { id: string, name: string }) => ({
          id: r.id,
          name: r.name,
        })),
      }

      const updated = (
        await request(app.getHttpServer())
          .put(`/courses/${id}`)
          .send(payload)
          .expect(200)
      ).body

      expect(updated.weeks).toHaveLength(1)
      expect(updated.weeks[0].id).toBe(week1.id) // week id preserved
      expect(updated.weeks[0].title).toBe('Birinci Bab (düzenlendi)')
      expect(updated.weeks[0].lessons).toHaveLength(2) // kept + new
      expect(updated.weeks[0].lessons[0].id).toBe(lesson1.id) // lesson id preserved
      expect(updated.weeks[0].lessons[0].title).toBe('Açılış (düzenlendi)')
      expect(updated.muderris[0].id).toBe(detail.muderris[0].id) // müderris id preserved
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

  describe('enrollment approval', () => {
    const approvalCourse = () => ({ ...coursePayload(), requiresApproval: true });

    it('holds the enrollment as PENDING and supports the approve flow', async () => {
      const created = await request(app.getHttpServer())
        .post(`/kosks/${koskId}/courses`)
        .send(approvalCourse())
        .expect(201);
      expect(created.body).toHaveProperty('requiresApproval', true);
      const id = created.body.id;

      await request(app.getHttpServer())
        .post(`/courses/${id}/enroll`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'PENDING');
          expect(res.body).toHaveProperty('studentName', 'test');
        });

      // pending enrollments are hidden from the student's enrolled list
      await request(app.getHttpServer())
        .get('/courses/enrolled')
        .expect(200)
        .expect((res) => expect(res.body).toEqual([]));

      // owner sees the request
      await request(app.getHttpServer())
        .get(`/kosks/${koskId}/enrollments/pending`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('userId', TEST_USER_ID);
          expect(res.body[0]).toHaveProperty('courseTitle', created.body.title);
          expect(res.body[0]).toHaveProperty('status', 'PENDING');
        });

      await request(app.getHttpServer())
        .post(`/courses/${id}/enrollments/${TEST_USER_ID}/approve`)
        .expect(201)
        .expect((res) => expect(res.body).toHaveProperty('status', 'ENROLLED'));

      await request(app.getHttpServer())
        .get('/courses/enrolled')
        .expect(200)
        .expect((res) => expect(res.body).toHaveLength(1));

      await request(app.getHttpServer())
        .get(`/kosks/${koskId}/enrollments/pending`)
        .expect(200)
        .expect((res) => expect(res.body).toEqual([]));
    });

    it('rejects a pending enrollment by deleting it', async () => {
      const created = await request(app.getHttpServer())
        .post(`/kosks/${koskId}/courses`)
        .send(approvalCourse())
        .expect(201);
      const id = created.body.id;

      await request(app.getHttpServer())
        .post(`/courses/${id}/enroll`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/courses/${id}/enrollments/${TEST_USER_ID}`)
        .expect(200)
        .expect((res) => expect(res.text).toBe('true'));

      await request(app.getHttpServer())
        .get(`/kosks/${koskId}/enrollments/pending`)
        .expect(200)
        .expect((res) => expect(res.body).toEqual([]));
    });

    it('enrolls directly when approval is not required', async () => {
      const created = await createCourse().expect(201);
      return request(app.getHttpServer())
        .post(`/courses/${created.body.id}/enroll`)
        .expect(201)
        .expect((res) => expect(res.body).toHaveProperty('status', 'ENROLLED'));
    });

    it('forbids listing pending enrollments for a köşk owned by someone else', async () => {
      const [otherKosk] = await databaseService.db
        .insert(kosks)
        .values({ ownerId: OTHER_USER_ID, name: 'Başka Köşk' })
        .returning();
      return request(app.getHttpServer())
        .get(`/kosks/${otherKosk.id}/enrollments/pending`)
        .expect(403);
    });
  });

  describe('ownership', () => {
    it('forbids course mutations on a köşk owned by someone else', async () => {
      // köşk + course owned by a different user, inserted directly
      const [otherKosk] = await databaseService.db
        .insert(kosks)
        .values({ ownerId: OTHER_USER_ID, name: 'Başka Köşk' })
        .returning();
      const [otherCourse] = await databaseService.db
        .insert(courses)
        .values({
          koskId: otherKosk.id,
          authorId: OTHER_USER_ID,
          title: 'Başka Kurs',
        })
        .returning();

      // create under someone else's köşk
      await request(app.getHttpServer())
        .post(`/kosks/${otherKosk.id}/courses`)
        .send(coursePayload())
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/courses/${otherCourse.id}`)
        .send({ title: 'Ele geçirildi' })
        .expect(403);

      await request(app.getHttpServer())
        .put(`/courses/${otherCourse.id}`)
        .send(coursePayload())
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/courses/${otherCourse.id}`)
        .expect(403);
    });
  });
});
