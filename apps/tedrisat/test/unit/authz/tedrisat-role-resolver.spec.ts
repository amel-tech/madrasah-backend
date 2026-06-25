import { ENTITIES, ROLES } from '@madrasah/common';
import { TedrisatRoleResolver } from '../../../src/authz/tedrisat-role-resolver.service';
import { DatabaseService } from '../../../src/database/database.service';
import { EnrollmentStatus } from '../../../src/course/domain/enrollment-status.enum';

interface DeckRow {
  id: string;
  isPublic: boolean;
  authorId: string;
}
interface KoskRow {
  id: string;
  ownerId: string;
}
interface CourseRow {
  id: string;
  koskId: string;
}
interface MuderrisRow {
  id: string;
}
interface EnrollmentRow {
  status: EnrollmentStatus;
}

interface Stubs {
  deck?: DeckRow | null;
  kosk?: KoskRow | null;
  course?: CourseRow | null;
  parentKosk?: KoskRow | null;
  muderris?: MuderrisRow | null;
  enrollment?: EnrollmentRow | null;
}

const dbStub = (s: Stubs = {}): DatabaseService =>
  ({
    db: {
      query: {
        decks: {
          findFirst: jest.fn().mockResolvedValue(s.deck ?? null),
        },
        // Each resolution path makes a single `kosks.findFirst` call —
        // direct köşk lookup for kosk dispatch, or parent köşk lookup
        // for course dispatch — so one mock value handles both cases.
        kosks: {
          findFirst: jest
            .fn()
            .mockResolvedValue(s.kosk ?? s.parentKosk ?? null),
        },
        courses: {
          findFirst: jest.fn().mockResolvedValue(s.course ?? null),
        },
        courseMuderris: {
          findFirst: jest.fn().mockResolvedValue(s.muderris ?? null),
        },
        enrollments: {
          findFirst: jest.fn().mockResolvedValue(s.enrollment ?? null),
        },
      },
    },
  }) as unknown as DatabaseService;

const REAL_UUID = '11111111-1111-1111-1111-111111111111';
const OTHER_UUID = '22222222-2222-2222-2222-222222222222';
const KOSK_UUID = '33333333-3333-3333-3333-333333333333';

describe('TedrisatRoleResolver', () => {
  describe('flashcard-deck dispatch', () => {
    it('returns DECK_OWNER when caller authored a private deck', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({ deck: { id: REAL_UUID, isPublic: false, authorId: 'owner-1' } }),
      );
      await expect(
        resolver.resolve('owner-1', { entity: ENTITIES.FLASHCARD_DECK, id: REAL_UUID }),
      ).resolves.toBe(ROLES.DECK_OWNER);
    });

    it('returns null (strict deny) for a stranger on a private deck', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({ deck: { id: REAL_UUID, isPublic: false, authorId: 'owner-1' } }),
      );
      await expect(
        resolver.resolve('stranger', { entity: ENTITIES.FLASHCARD_DECK, id: REAL_UUID }),
      ).resolves.toBeNull();
    });

    it('returns PUBLIC for a public deck', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({ deck: { id: REAL_UUID, isPublic: true, authorId: 'admin' } }),
      );
      await expect(
        resolver.resolve('anyone', { entity: ENTITIES.FLASHCARD_DECK, id: REAL_UUID }),
      ).resolves.toBe(ROLES.PUBLIC);
    });

    it('returns PUBLIC when the deck does not exist', async () => {
      const resolver = new TedrisatRoleResolver(dbStub({ deck: null }));
      await expect(
        resolver.resolve('u', { entity: ENTITIES.FLASHCARD_DECK, id: OTHER_UUID }),
      ).resolves.toBe(ROLES.PUBLIC);
    });

    it('returns PUBLIC for non-UUID deck ids', async () => {
      const resolver = new TedrisatRoleResolver(dbStub());
      await expect(
        resolver.resolve('u', { entity: ENTITIES.FLASHCARD_DECK, id: 'new' }),
      ).resolves.toBe(ROLES.PUBLIC);
    });
  });

  describe('kosk dispatch', () => {
    it('returns KOSK_MANAGER when caller owns the köşk', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({ kosk: { id: REAL_UUID, ownerId: 'manager-1' } }),
      );
      await expect(
        resolver.resolve('manager-1', { entity: ENTITIES.KOSK, id: REAL_UUID }),
      ).resolves.toBe(ROLES.KOSK_MANAGER);
    });

    it('returns PUBLIC for any non-owner on an existing köşk', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({ kosk: { id: REAL_UUID, ownerId: 'manager-1' } }),
      );
      await expect(
        resolver.resolve('stranger', { entity: ENTITIES.KOSK, id: REAL_UUID }),
      ).resolves.toBe(ROLES.PUBLIC);
    });

    it('returns PUBLIC when the köşk does not exist', async () => {
      const resolver = new TedrisatRoleResolver(dbStub({ kosk: null }));
      await expect(
        resolver.resolve('u', { entity: ENTITIES.KOSK, id: OTHER_UUID }),
      ).resolves.toBe(ROLES.PUBLIC);
    });

    it('returns PUBLIC for non-UUID köşk ids', async () => {
      const resolver = new TedrisatRoleResolver(dbStub());
      await expect(
        resolver.resolve('u', { entity: ENTITIES.KOSK, id: 'new' }),
      ).resolves.toBe(ROLES.PUBLIC);
    });
  });

  describe('course dispatch (priority: kosk_manager > muderris > enrolled > pending > public)', () => {
    it('returns KOSK_MANAGER when caller owns the parent köşk', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({
          course: { id: REAL_UUID, koskId: KOSK_UUID },
          parentKosk: { id: KOSK_UUID, ownerId: 'manager-1' },
        }),
      );
      await expect(
        resolver.resolve('manager-1', { entity: ENTITIES.COURSE, id: REAL_UUID }),
      ).resolves.toBe(ROLES.KOSK_MANAGER);
    });

    it('returns MUDERRIS when caller is listed in course_muderris', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({
          course: { id: REAL_UUID, koskId: KOSK_UUID },
          parentKosk: { id: KOSK_UUID, ownerId: 'someone-else' },
          muderris: { id: 'm-1' },
        }),
      );
      await expect(
        resolver.resolve('teacher-1', { entity: ENTITIES.COURSE, id: REAL_UUID }),
      ).resolves.toBe(ROLES.MUDERRIS);
    });

    it('returns ENROLLED when caller has an ENROLLED enrollment', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({
          course: { id: REAL_UUID, koskId: KOSK_UUID },
          parentKosk: { id: KOSK_UUID, ownerId: 'someone-else' },
          enrollment: { status: EnrollmentStatus.ENROLLED },
        }),
      );
      await expect(
        resolver.resolve('talebe-1', { entity: ENTITIES.COURSE, id: REAL_UUID }),
      ).resolves.toBe(ROLES.ENROLLED);
    });

    it('returns PENDING when caller has a PENDING enrollment', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({
          course: { id: REAL_UUID, koskId: KOSK_UUID },
          parentKosk: { id: KOSK_UUID, ownerId: 'someone-else' },
          enrollment: { status: EnrollmentStatus.PENDING },
        }),
      );
      await expect(
        resolver.resolve('talebe-pending', { entity: ENTITIES.COURSE, id: REAL_UUID }),
      ).resolves.toBe(ROLES.PENDING);
    });

    it('returns PUBLIC for a stranger with no relationship to the course', async () => {
      const resolver = new TedrisatRoleResolver(
        dbStub({
          course: { id: REAL_UUID, koskId: KOSK_UUID },
          parentKosk: { id: KOSK_UUID, ownerId: 'someone-else' },
        }),
      );
      await expect(
        resolver.resolve('stranger', { entity: ENTITIES.COURSE, id: REAL_UUID }),
      ).resolves.toBe(ROLES.PUBLIC);
    });

    it('returns PUBLIC when the course does not exist', async () => {
      const resolver = new TedrisatRoleResolver(dbStub({ course: null }));
      await expect(
        resolver.resolve('u', { entity: ENTITIES.COURSE, id: OTHER_UUID }),
      ).resolves.toBe(ROLES.PUBLIC);
    });
  });

  describe('entities without DB-backed role yet', () => {
    it.each([ENTITIES.MADRASAH, ENTITIES.IJAZAH] as const)(
      'returns PUBLIC for %s (provisional until tables land)',
      async (entity) => {
        const resolver = new TedrisatRoleResolver(dbStub());
        await expect(
          resolver.resolve('u', { entity, id: REAL_UUID }),
        ).resolves.toBe(ROLES.PUBLIC);
      },
    );
  });
});
