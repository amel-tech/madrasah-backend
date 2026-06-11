import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { ENTITIES, ResourceRef, Role, ROLES, RoleResolver } from '@madrasah/common';
import { DatabaseService } from '../database/database.service';
import { decks } from '../database/schema/flashcard-deck.schema';
import { kosks } from '../database/schema/kosk.schema';
import {
  courseMuderris,
  courses,
  enrollments,
} from '../database/schema/course.schema';
import { EnrollmentStatus } from '../course/domain/enrollment-status.enum';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves the caller's role on a given resource by consulting the
 * domain's ownership/enrollment tables.
 *
 * Returning `null` means **deny** — the caller has no role on this
 * resource and no public access is intended either. `AuthzService.can`
 * treats null as a hard deny (no `PUBLIC` fallback), so when a resource
 * is meant to be open to any authenticated caller (a public deck, a
 * non-existent ID on a create endpoint, the donate scope on a
 * madrasah), the resolver must explicitly return `ROLES.PUBLIC`.
 *
 * Wired entities so far: `flashcard-deck` (owner), `kosk` (manager).
 * `course`, `madrasah`, `ijazah` return `PUBLIC` provisionally so the
 * open scopes documented in plan §4 (view, enroll, donate) work.
 * Restricted scopes (`MANAGE_*`, `EDIT`, `DELETE`) deny because PUBLIC
 * does not list them — they will become role-based once each entity's
 * resolver lands.
 *
 * Priority rules for multi-role situations (applied as the
 * corresponding tables come online):
 *   - KOSK_MANAGER > MUDERRIS > ENROLLED > PENDING
 *   - MADRASAH_NAZIR > KOSK_MANAGER (when the kosk belongs to the nazır's medrese)
 *   - SYSTEM_ADMIN bypass is handled upstream in `AuthzService.isSystemAdmin`,
 *     not here.
 */
@Injectable()
export class TedrisatRoleResolver implements RoleResolver {
  constructor(private readonly db: DatabaseService) {}

  async resolve(userId: string, resource: ResourceRef): Promise<Role | null> {
    switch (resource.entity) {
      case ENTITIES.FLASHCARD_DECK:
        return this.resolveDeckRole(userId, resource);
      case ENTITIES.KOSK:
        return this.resolveKoskRole(userId, resource);
      case ENTITIES.COURSE:
        return this.resolveCourseRole(userId, resource);
      case ENTITIES.MADRASAH:
      case ENTITIES.IJAZAH:
        // TODO(authz): wire nazır / ijazah tables as they land. Until
        // then, PUBLIC keeps the entity's PUBLIC matrix row working
        // (e.g. madrasah donate). Restricted scopes are denied because
        // PUBLIC does not list them.
        return ROLES.PUBLIC;
      default:
        return null;
    }
  }

  /**
   * Deck role dispatch. Schema realises two variants: `isPublic = false`
   * (private) and `isPublic = true` (global). Other variants from plan
   * §4.2 will land with their foreign keys.
   *
   * - Non-UUID id ("new" used by the POST endpoint, malformed input):
   *   return PUBLIC so the create scope on the matrix's PUBLIC row
   *   applies. Defends against Postgres 22P02.
   * - Deck missing: return PUBLIC. The handler will 404 separately;
   *   the resolver shouldn't leak existence by switching outcomes here.
   * - Public deck: return PUBLIC (any authenticated caller may view).
   * - Private deck owned by the caller: DECK_OWNER.
   * - Private deck NOT owned: null → strict deny.
   */
  private async resolveDeckRole(
    userId: string,
    resource: ResourceRef,
  ): Promise<Role | null> {
    if (!UUID_REGEX.test(resource.id)) return ROLES.PUBLIC;

    const deck = await this.db.db.query.decks.findFirst({
      where: eq(decks.id, resource.id),
      columns: { id: true, isPublic: true, authorId: true },
    });
    if (!deck) return ROLES.PUBLIC;
    if (deck.isPublic) return ROLES.PUBLIC;
    return deck.authorId === userId ? ROLES.DECK_OWNER : null;
  }

  /**
   * Köşk role dispatch.
   *
   * - Non-UUID id ("new" sentinel from the create endpoint): PUBLIC so
   *   the matrix's CREATE_KOSK on PUBLIC applies.
   * - Köşk missing: PUBLIC. Mirrors the deck pattern — the controller
   *   surfaces 404 later when its own query returns nothing.
   * - Caller owns the köşk: KOSK_MANAGER.
   * - Otherwise: PUBLIC. Anyone authenticated may VIEW; EDIT/DELETE
   *   are not on the PUBLIC row so non-owners are denied.
   *
   * MADRASAH_NAZIR path is deferred until kosk→madrasah FK lands.
   */
  private async resolveKoskRole(
    userId: string,
    resource: ResourceRef,
  ): Promise<Role | null> {
    if (!UUID_REGEX.test(resource.id)) return ROLES.PUBLIC;

    const kosk = await this.db.db.query.kosks.findFirst({
      where: eq(kosks.id, resource.id),
      columns: { id: true, ownerId: true },
    });
    if (!kosk) return ROLES.PUBLIC;
    return kosk.ownerId === userId ? ROLES.KOSK_MANAGER : ROLES.PUBLIC;
  }

  /**
   * Course role dispatch.
   *
   * Priority (highest first):
   *   1. KOSK_MANAGER — caller owns the course's parent köşk
   *   2. MUDERRIS     — caller is listed in `course_muderris` for this course
   *   3. ENROLLED     — caller has an `ENROLLED` (or `COMPLETED`) enrollment
   *   4. PENDING      — caller has a `PENDING` enrollment awaiting approval
   *   5. PUBLIC       — any authenticated caller (covers ENROLL on a course
   *                     that exists)
   *
   * The MADRASAH_NAZIR path lands once the kosk→madrasah FK exists.
   */
  private async resolveCourseRole(
    userId: string,
    resource: ResourceRef,
  ): Promise<Role | null> {
    if (!UUID_REGEX.test(resource.id)) return ROLES.PUBLIC;

    const course = await this.db.db.query.courses.findFirst({
      where: eq(courses.id, resource.id),
      columns: { id: true, koskId: true },
    });
    if (!course) return ROLES.PUBLIC;

    // KOSK_MANAGER — the manager of the parent köşk owns every course
    // under it, regardless of muderris assignment.
    const parentKosk = await this.db.db.query.kosks.findFirst({
      where: eq(kosks.id, course.koskId),
      columns: { ownerId: true },
    });
    if (parentKosk?.ownerId === userId) return ROLES.KOSK_MANAGER;

    // MUDERRIS — listed in course_muderris for this course
    const muderris = await this.db.db.query.courseMuderris.findFirst({
      where: and(
        eq(courseMuderris.courseId, course.id),
        eq(courseMuderris.userId, userId),
      ),
      columns: { id: true },
    });
    if (muderris) return ROLES.MUDERRIS;

    // ENROLLED / PENDING — primary key is (userId, courseId)
    const enrollment = await this.db.db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.courseId, course.id),
        eq(enrollments.userId, userId),
      ),
      columns: { status: true },
    });
    if (enrollment?.status === EnrollmentStatus.PENDING) return ROLES.PENDING;
    if (enrollment) return ROLES.ENROLLED; // ENROLLED or COMPLETED

    return ROLES.PUBLIC;
  }
}
