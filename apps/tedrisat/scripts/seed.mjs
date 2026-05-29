// Mock data seeder for the tedrisat DB.
//
// Inserts several köşks + courses (with weeks/lessons/müderris/resources),
// a few enrollments and follows — all owned by the dev user so they're
// editable in nizam (AuthGuard dev-bypass uses this same sub).
//
// Usage: node apps/tedrisat/scripts/seed.mjs
//   Honors DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME (defaults below).

import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'

// Owner/author for all seeded data. Set SEED_OWNER_ID to YOUR Keycloak user
// `sub` so you can edit köşks/courses in nizam and see follow/progress states.
const OWNER = process.env.SEED_OWNER_ID || '623fdf08-fd0e-481b-a927-4a1c15135e62'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || 'tedrisat',
  password: process.env.DB_PASSWORD || 'tedrisat',
  database: process.env.DB_NAME || 'tedrisat_db',
})

// ---- mock dataset -------------------------------------------------------
const lesson = (title, type, duration, kaynak, isPreview = false) => ({
  title,
  type,
  duration,
  kaynak,
  isPreview,
})
const week = (weekNumber, title, summary, lessons) => ({
  weekNumber,
  title,
  summary,
  lessons,
})

const KOSKS = [
  {
    name: 'Süleymaniye Köşkü',
    handle: '@suleymaniye',
    description:
      'Klasik medrese müfredatına dayalı; sarf, nahiv, mantık ve usûl-i fıkıh dersleri sunan köşk. Her hafta canlı müzakereler.',
    coverHue: 215,
    isPrivate: false,
    field: 'Âlet ilimleri',
    level: 'ALL',
    tags: ['Arapça', 'Fıkıh', 'Akaid', 'Mantık'],
    verified: true,
    featured: true,
    rating: 4.8,
    ratingCount: 132,
    courses: [
      {
        title: 'Emsile — Sarf\'a Giriş',
        subtitle: 'Birinci sınıf · 8 hafta',
        category: 'Sarf',
        level: 'BEGINNER',
        language: 'Türkçe / Arapça',
        coverHue: 28,
        durationWeeks: 8,
        status: 'PUBLISHED',
        grantsCertificate: true,
        muderris: [{ name: 'Müderris Ömer Faruk', title: 'Sarf Müderrisi', avatarHue: 28 }],
        resources: [{ name: 'Emsile — Klasik metin', meta: 'PDF · 64 sayfa', type: 'pdf' }],
        weeks: [
          week(1, 'Sülâsî Mücerred — Giriş', 'Babların tanıtımı.', [
            lesson('Açılış mütalaası', 'VIDEO', '12 dk', null, true),
            lesson('Birinci bab', 'VIDEO', '24 dk', 'Emsile · s. 2-6'),
          ]),
          week(2, 'İkinci ve Üçüncü Bab', null, [
            lesson('İkinci bab şerhi', 'VIDEO', '26 dk', null),
            lesson('Ölçme', 'QUIZ', '10 soru', null),
          ]),
        ],
      },
      {
        title: 'Bina ve İzhar Şerhi',
        subtitle: 'İkinci sınıf · 10 hafta',
        category: 'Sarf',
        level: 'INTERMEDIATE',
        language: 'Türkçe / Arapça',
        coverHue: 145,
        durationWeeks: 10,
        status: 'PUBLISHED',
        grantsCertificate: true,
        muderris: [
          { name: 'Müderris Ahmed Hilmi', title: 'Sarf ve Nahiv Müderrisi', avatarHue: 145 },
          { name: 'Müderris Ömer Faruk', title: 'Müzakere', avatarHue: 28 },
        ],
        resources: [
          { name: 'Bina ve İzhar — Klasik metin', meta: 'PDF · 124 sayfa', type: 'pdf' },
          { name: 'Sarf — Vocabulary Deck', meta: 'Deste · 86 kart', type: 'deck' },
        ],
        weeks: [
          week(1, 'Sülâsî Mücerred — Birinci Bab', 'Müfredat tanıtımı ve îsâgûcî.', [
            lesson('Açılış mütalaası', 'VIDEO', '12 dk', null, true),
            lesson('Birinci babın îsâgûcîsi', 'VIDEO', '28 dk', 'Bina · s. 4-9'),
            lesson('Türev örnekleri', 'DOCUMENT', 'PDF', 'Tatbikat 1'),
            lesson('Hafta sonu müzakeresi', 'LIVE', '45 dk', 'Canlı halka'),
          ]),
          week(2, 'İkinci ve Üçüncü Bab', 'نَصَر / ضَرَب bablları.', [
            lesson('İkinci bab şerhi', 'VIDEO', '32 dk', 'Bina · s. 10-15'),
            lesson('Üçüncü bab şerhi', 'VIDEO', '30 dk', 'Bina · s. 16-19'),
            lesson('Ölçme ve değerlendirme', 'QUIZ', '10 soru', null),
          ]),
          week(3, 'Dördüncü ve Beşinci Bab', 'فَتَح bâbı ve harf-i halk illetleri.', [
            lesson('Dördüncü babın şerhi', 'VIDEO', '29 dk', null),
            lesson('Tatbikat defteri 3', 'DOCUMENT', 'PDF', null),
          ]),
        ],
      },
    ],
  },
  {
    name: 'Fâtih Köşkü',
    handle: '@fatih',
    description: 'Tefsir ve hadis usûlü ağırlıklı; rivayet zincirleri ve metin tahlili.',
    coverHue: 28,
    isPrivate: false,
    field: 'Tefsir & Hadis',
    level: 'ALL',
    tags: ['Tefsir', 'Hadis'],
    verified: true,
    featured: false,
    rating: 4.7,
    ratingCount: 96,
    courses: [
      {
        title: 'Tefsir Usûlüne Giriş',
        subtitle: 'Birinci sınıf · 6 hafta',
        category: 'Tefsir',
        level: 'BEGINNER',
        language: 'Türkçe',
        coverHue: 200,
        durationWeeks: 6,
        status: 'PUBLISHED',
        grantsCertificate: false,
        muderris: [{ name: 'Müderris Fatih Kaya', title: 'Tefsir Müderrisi', avatarHue: 200 }],
        resources: [{ name: 'Tefsir Usûlü', meta: 'PDF · 88 sayfa', type: 'pdf' }],
        weeks: [
          week(1, 'Vahyin Nüzulü', null, [
            lesson('Giriş', 'VIDEO', '18 dk', null, true),
            lesson('Mekkî ve Medenî', 'VIDEO', '22 dk', null),
          ]),
          week(2, 'Esbâb-ı Nüzul', null, [
            lesson('Sebepler ilmi', 'VIDEO', '20 dk', null),
            lesson('Müzakere', 'LIVE', '40 dk', null),
          ]),
        ],
      },
    ],
  },
  {
    name: 'Beyazıt Köşkü',
    handle: '@beyazit',
    description: "Mantık ve âdâbu'l-bahs üzerine yoğunlaşan ileri düzey halkalar.",
    coverHue: 270,
    isPrivate: false,
    field: 'Âlet ilimleri',
    level: 'ADVANCED',
    tags: ['Mantık', 'Münâzara'],
    verified: false,
    featured: false,
    rating: 4.9,
    ratingCount: 54,
    courses: [
      {
        title: 'Îsâgûcî — Mantığa Giriş',
        subtitle: 'Birinci sınıf · 6 hafta',
        category: 'Mantık',
        level: 'BEGINNER',
        language: 'Türkçe / Arapça',
        coverHue: 60,
        durationWeeks: 6,
        status: 'PUBLISHED',
        grantsCertificate: true,
        muderris: [{ name: 'Müderris İbrahim Aksoy', title: 'Mantık Müderrisi', avatarHue: 340 }],
        resources: [{ name: 'Îsâgûcî metni', meta: 'PDF · 40 sayfa', type: 'pdf' }],
        weeks: [
          week(1, 'Tasavvur ve Tasdik', null, [
            lesson('Giriş', 'VIDEO', '16 dk', null, true),
            lesson('Külliyât-ı Hams', 'VIDEO', '24 dk', null),
          ]),
        ],
      },
      {
        title: "Âdâbu'l-Bahs",
        subtitle: 'Üçüncü sınıf · 8 hafta',
        category: 'Mantık',
        level: 'ADVANCED',
        language: 'Arapça',
        coverHue: 300,
        durationWeeks: 8,
        status: 'DRAFT',
        grantsCertificate: false,
        muderris: [{ name: 'Müderris İbrahim Aksoy', title: 'Münâzara', avatarHue: 340 }],
        resources: [],
        weeks: [
          week(1, 'Münâzara Âdâbı', null, [
            lesson('Giriş', 'VIDEO', '20 dk', null),
          ]),
        ],
      },
    ],
  },
  {
    name: 'Karaman Köşkü',
    handle: '@karaman',
    description: 'Yeni başlayanlar için Arapça sarf-nahiv ve kıraat temelleri.',
    coverHue: 145,
    isPrivate: false,
    field: 'Âlet ilimleri',
    level: 'BEGINNER',
    tags: ['Arapça', 'Kıraat'],
    verified: false,
    featured: false,
    rating: 4.6,
    ratingCount: 38,
    courses: [
      {
        title: 'Avâmil — Nahiv Esasları',
        subtitle: 'Birinci sınıf · 6 hafta',
        category: 'Nahiv',
        level: 'BEGINNER',
        language: 'Türkçe / Arapça',
        coverHue: 270,
        durationWeeks: 6,
        status: 'PUBLISHED',
        grantsCertificate: false,
        muderris: [{ name: 'Müderris Selim Yavuz', title: 'Nahiv Müderrisi', avatarHue: 270 }],
        resources: [{ name: 'Avâmil', meta: 'PDF · 30 sayfa', type: 'pdf' }],
        weeks: [
          week(1, 'Âmiller', null, [
            lesson('Giriş', 'VIDEO', '14 dk', null, true),
            lesson('Lafzî âmiller', 'VIDEO', '22 dk', null),
            lesson('Ölçme', 'QUIZ', '8 soru', null),
          ]),
        ],
      },
    ],
  },
  {
    name: 'Nûruosmaniye Köşkü',
    handle: '@nuruosmaniye',
    description: 'Akaid ve kelâm metinleri; Nesefî ve Senûsî şerhleri.',
    coverHue: 340,
    isPrivate: true,
    field: 'Akaid & Kelâm',
    level: 'INTERMEDIATE',
    tags: ['Akaid', 'Kelâm'],
    verified: true,
    featured: false,
    rating: 4.8,
    ratingCount: 71,
    courses: [
      {
        title: 'Akâid-i Nesefî Şerhi',
        subtitle: 'İkinci sınıf · 10 hafta',
        category: 'Akaid',
        level: 'INTERMEDIATE',
        language: 'Türkçe / Arapça',
        coverHue: 12,
        durationWeeks: 10,
        status: 'PUBLISHED',
        grantsCertificate: true,
        muderris: [{ name: 'Müderris Hasan Basri', title: 'Kelâm Müderrisi', avatarHue: 12 }],
        resources: [{ name: 'Akâid-i Nesefî', meta: 'PDF · 110 sayfa', type: 'pdf' }],
        weeks: [
          week(1, 'İlâhiyyât', null, [
            lesson('Giriş', 'VIDEO', '20 dk', null, true),
            lesson('Sıfatlar', 'VIDEO', '28 dk', null),
            lesson('Müzakere', 'LIVE', '45 dk', null),
          ]),
          week(2, 'Nübüvvât', null, [
            lesson('Peygamberlik', 'VIDEO', '26 dk', null),
          ]),
        ],
      },
    ],
  },
]

// follow these köşk handles + enroll in these course titles as the dev user
const FOLLOW_HANDLES = ['@suleymaniye', '@nuruosmaniye']
const ENROLL = [
  { title: 'Bina ve İzhar Şerhi', progress: 35 },
  { title: 'Emsile — Sarf\'a Giriş', progress: 72 },
  { title: 'Avâmil — Nahiv Esasları', progress: 100 },
]

// courses whose enrollment needs köşk-owner approval
const APPROVAL_TITLES = new Set(['Avâmil — Nahiv Esasları'])

// pending enrollment requests (other students) shown to the owner in nizam
const PENDING_REQUESTS = [
  {
    title: 'Avâmil — Nahiv Esasları',
    students: [
      { name: 'Yusuf Karahan', email: 'yusuf.karahan@example.com' },
      { name: 'Zeynep Aksoy', email: 'zeynep.aksoy@example.com' },
    ],
  },
]

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // wipe existing köşks (cascades to courses/weeks/lessons/müderris/resources/enrollments/followers)
    await client.query('DELETE FROM kosks')

    let kosksN = 0
    let coursesN = 0
    const courseIdByTitle = new Map()
    const koskIdByHandle = new Map()

    for (const k of KOSKS) {
      const koskId = randomUUID()
      koskIdByHandle.set(k.handle, koskId)
      await client.query(
        `INSERT INTO kosks (id, owner_id, name, handle, description, cover_hue, is_private, field, level, tags, verified, featured, rating, rating_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [koskId, OWNER, k.name, k.handle, k.description, k.coverHue, k.isPrivate, k.field, k.level, k.tags, k.verified, k.featured, k.rating, k.ratingCount],
      )
      kosksN++

      for (const c of k.courses) {
        const courseId = randomUUID()
        courseIdByTitle.set(c.title, courseId)
        await client.query(
          `INSERT INTO courses (id, kosk_id, author_id, title, subtitle, description, category, level, language, cover_hue, duration_weeks, status, grants_certificate, requires_approval)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [courseId, koskId, OWNER, c.title, c.subtitle, c.description ?? null, c.category, c.level, c.language, c.coverHue, c.durationWeeks, c.status, c.grantsCertificate, APPROVAL_TITLES.has(c.title)],
        )
        coursesN++

        for (let mi = 0; mi < c.muderris.length; mi++) {
          const m = c.muderris[mi]
          await client.query(
            `INSERT INTO course_muderris (id, course_id, name, title, bio, avatar_hue, order_index)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [randomUUID(), courseId, m.name, m.title ?? null, m.bio ?? null, m.avatarHue ?? 220, mi],
          )
        }
        for (let ri = 0; ri < c.resources.length; ri++) {
          const r = c.resources[ri]
          await client.query(
            `INSERT INTO course_resources (id, course_id, name, meta, type, url, order_index)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [randomUUID(), courseId, r.name, r.meta ?? null, r.type ?? null, r.url ?? null, ri],
          )
        }
        for (let wi = 0; wi < c.weeks.length; wi++) {
          const w = c.weeks[wi]
          const weekId = randomUUID()
          await client.query(
            `INSERT INTO course_weeks (id, course_id, week_number, title, summary, order_index)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [weekId, courseId, w.weekNumber, w.title, w.summary ?? null, wi],
          )
          for (let li = 0; li < w.lessons.length; li++) {
            const l = w.lessons[li]
            await client.query(
              `INSERT INTO lessons (id, week_id, title, type, duration, kaynak, is_preview, order_index)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
              [randomUUID(), weekId, l.title, l.type, l.duration ?? null, l.kaynak ?? null, l.isPreview ?? false, li],
            )
          }
        }
      }
    }

    for (const handle of FOLLOW_HANDLES) {
      const koskId = koskIdByHandle.get(handle)
      if (koskId) {
        await client.query(
          `INSERT INTO kosk_followers (user_id, kosk_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [OWNER, koskId],
        )
      }
    }

    for (const e of ENROLL) {
      const courseId = courseIdByTitle.get(e.title)
      if (courseId) {
        await client.query(
          `INSERT INTO enrollments (user_id, course_id, progress, status) VALUES ($1,$2,$3,$4)
           ON CONFLICT (user_id, course_id) DO UPDATE SET progress = EXCLUDED.progress, status = EXCLUDED.status`,
          [OWNER, courseId, e.progress, e.progress >= 100 ? 'COMPLETED' : 'ENROLLED'],
        )
      }
    }

    let pendingN = 0
    for (const p of PENDING_REQUESTS) {
      const courseId = courseIdByTitle.get(p.title)
      if (!courseId) continue
      for (const s of p.students) {
        await client.query(
          `INSERT INTO enrollments (user_id, course_id, student_name, student_email, progress, status)
           VALUES ($1,$2,$3,$4,0,'PENDING')
           ON CONFLICT (user_id, course_id) DO NOTHING`,
          [randomUUID(), courseId, s.name, s.email],
        )
        pendingN++
      }
    }

    await client.query('COMMIT')
    console.log(`Seeded ${kosksN} köşks, ${coursesN} courses, ${FOLLOW_HANDLES.length} follows, ${ENROLL.length} enrollments, ${pendingN} pending requests.`)
  }
  catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err)
    process.exitCode = 1
  }
  finally {
    client.release()
    await pool.end()
  }
}

void main()
